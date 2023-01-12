import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

let workInProgress: FiberNode | null = null;

/**
 * 在Fiber中调度Update
 * 连接updateContainer
 * @param {FiberNode} fiber
 */
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// 获取Fiber节点的双缓存根节点
	const root = markUpdateLaneFromFiberToRoot(fiber);
	if (root === null) {
		return;
	}
	ensureRootIsScheduled(root);
}

/**
 * 获取传入Fiber节点的 双缓存根节点
 * @param {FiberNode} fiber
 * @return {any}
 */
function markUpdateLaneFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	// 遍历链表
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

function ensureRootIsScheduled(root: FiberRootNode) {
	// 一些调度行为
	performSyncWorkOnRoot(root);
}

function performSyncWorkOnRoot(root: FiberRootNode) {
	// 初始化操作 即创建一个新的Fiber根节点
	prepareFreshStack(root);
	// render阶段具体操作
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			console.error('workLoop发生错误', e);
			workInProgress = null;
		}
	} while (true);

	if (workInProgress !== null) {
		console.error('render阶段结束时wip不为null');
	}
	// 获取current的alternate 即 wip根节点
	const finishedWork = root.current.alternate;
	// 将完成的wip节点挂载到current的finishedWork属性上
	root.finishedWork = finishedWork;

	// commit阶段操作
	commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;

	if (finishedWork === null) {
		return;
	}
	// 重置
	root.finishedWork = null;

	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

	if (subtreeHasEffect || rootHasEffect) {
		// 有副作用要执行

		// 阶段1/3:beforeMutation

		// 阶段2/3:Mutation
		commitMutationEffects(finishedWork);

		// Fiber Tree切换
		root.current = finishedWork;

		// 阶段3:Layout
	} else {
		// Fiber Tree切换
		root.current = finishedWork;
	}
}

/**
 * 刷新栈帧: 重置 FiberRoot上的全局属性 和 `fiber树构造`循环过程中的全局变量
 * @param {FiberRootNode} root
 */
function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

/**
 * 工作循环,递归遍历workInProgress
 */
function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	// 递阶段
	const next = beginWork(fiber);
	if (next === null) {
		//  归阶段
		completeUnitOfWork(fiber);
	} else {
		// 更换指针
		workInProgress = next;
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;

	do {
		const next = completeWork(node);

		if (next !== null) {
			workInProgress = next;
			return;
		}

		const sibling = node.sibling;
		if (sibling) {
			// 兄弟节点
			workInProgress = next;
			return;
		}
		// 节点向上
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
