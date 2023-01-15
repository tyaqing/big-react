import { FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags, Placement } from './fiberFlags';
import { HostComponent, HostRoot, HostText } from './workTags';
import { appendChildToContainer, Container } from 'hostConfig';

let nextEffect: FiberNode | null = null;

/**
 * 执行placement对应操作
 * @param {FiberNode} finishedWork // 已执行完成的fiber树
 */
export function commitMutationEffects(finishedWork: FiberNode) {
	// 指向根节点的Fiber Node
	nextEffect = finishedWork;
	while (nextEffect !== null) {
		// 向下遍历
		const child: FiberNode | null = nextEffect.child;
		// 如果有副作用,并且有子节点
		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			nextEffect = child;
		} else {
			//   向上遍历
			up: while (nextEffect !== null) {
				commitMutationEffectsOnFiber(nextEffect);
				const sibling: FiberNode | null = nextEffect.sibling;
				// 再看下有没有兄弟节点
				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}
				// 没有就向上
				nextEffect = nextEffect.return;
			}
		}
	}
}

/**
 * 处理包含副作用的节点
 * @param {FiberNode} finishedWork
 */
const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags;
	// 处理需要Placement的节点
	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork);
		// 移除掉flag中的Placement位
		finishedWork.flags &= ~Placement;
	}
	// TODO update
	// TODO childDeletion
};

const commitPlacement = (finishedWork: FiberNode) => {
	if (__DEV__) console.warn('执行placement操作', finishedWork);
	// parent DOM
	const hostParent = getHostParent(finishedWork);
	// finishedWork 的dom append 到 parent DOM中
	appendPlacementNodeIntoContainer(finishedWork, hostParent);
};

/**
 * 获取宿主环境的parent节点
 * @param {FiberNode} fiber
 */
function getHostParent(fiber: FiberNode) {
	let parent = fiber.return;
	while (parent) {
		const parentTag = parent.tag;
		// HostRoot HostComponent
		if (parentTag === HostComponent) {
			return parent.stateNode as Container;
		}
		if (parentTag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container;
		}
		parent = parent.return;
	}
	if (__DEV__) console.warn('未找到host parent', fiber);
}

/**
 * 插入节点
 * @param {FiberNode} finishedWork
 * @param {} hostParent
 */
function appendPlacementNodeIntoContainer(
	finishedWork: FiberNode,
	hostParent: Container
) {
	// 只处理这两种tag,因为HostRoot不是真实dom节点
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(finishedWork.stateNode, hostParent);
		return;
	}
	// 向下遍历
	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent);
		let sibling = child.sibling;
		// sibling是横向的链表,可以while递归
		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
}
