import { FiberNode } from './fiber';
import { NoFlags } from './fiberFlags';
import {
	appendInitialChild,
	createInstance,
	createTextInstance,
	Instance
} from 'hostConfig';
import { HostComponent, HostRoot, HostText } from './workTags';

/**
 * 对于Host类型的FiberNode :构建离屏DOM树
 * 标记Update flag
 * @param {FiberNode} wip
 * @return {null}
 */
export const completeWork = (wip: FiberNode) => {
	// 获取当前节点传入的props
	const newProps = wip.pendingProps;
	// 当前渲染树的根节点
	const current = wip.alternate;

	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// update情况
			} else {
				// mount
				// 1.构建DOM
				const instance = createInstance(wip.type, newProps);
				// 2.将DOM插入到DOM树中
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperites(wip);
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				// update情况
			} else {
				// mount
				// 1.构建DOM
				const instance = createTextInstance(newProps.content);

				wip.stateNode = instance;
			}
			bubbleProperites(wip);
			return null;
		case HostRoot:
			bubbleProperites(wip);
			return null;
		default:
			if (__DEV__) console.warn('未处理的completeWork', wip);
	}
	return null;
};

/**
 * mount阶段时, 需要将新节点插入
 * 这里的顺序类似一个环形列表,往下找到null后还会再次回到第一个节点
 * @param {FiberNode} parent
 * @param {FiberNode} wip
 */
function appendAllChildren(parent: Instance, wip: FiberNode) {
	// 获取当前指针的子Fiber
	let node = wip.child;
	// 在 <div> <A/> <A/> </div> 这种情况下  node有可能是多个 因此需要递归node的sibling
	while (node !== null) {
		// 当node是普通节点或者文本节点
		if (node?.tag === HostComponent || node?.tag === HostText) {
			// 在父节点上插入这个子节点
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			// 设置子节点的父节点为当前节点
			node.child.return = node;
			// 节点指针下移
			node = node.child;
			continue;
		}
		// 如果回到原节点就结束
		if (node === wip) return;
		// 找不到兄弟节点
		while (node.sibling === null) {
			// 回到原点就退出
			if (node.return === null || node.return === wip) {
				return;
			}
			// 向上递归
			node = node.return;
		}
		// 如果能找到兄弟节点,指针再指下去
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

/**
 * 冒泡传递flags 可以通过此判断子树是否有副作用
 * @param {FiberNode} wip
 */
function bubbleProperites(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;

	while (child !== null) {
		// 按位与
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;
		// 向
		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}
