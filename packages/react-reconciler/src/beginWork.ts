import { ReactElementType } from 'shared/ReactTypes';
import { mountChildFibers, reconcileChildFibers } from './childFiber';
import { FiberNode } from './fiber';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';
import { renderWithHooks } from './fiberHooks';

/**
 * 递归中的递
 * @param {FiberNode} wip
 * @return {FiberNode | null}
 */
export const beginWork = (wip: FiberNode) => {
	switch (wip.tag) {
		case HostRoot:
			// 处理Fiber根节点
			return updateHostRoot(wip);
		case HostComponent:
			// 处理普通的Fiber节点
			return updateHostComponent(wip);
		case HostText:
			// 无子节点
			return null;
		case FunctionComponent:
			return updateFunctionComponent(wip);
		default:
			if (__DEV__) console.error('beginWork未处理的情况');
	}
	return null;
};

function updateFunctionComponent(wip: FiberNode) {
	// 执行函数获得组件
	const nextChildren = renderWithHooks(wip);
	// 调度子节点
	reconcileChildren(wip, nextChildren);
	// 返回子节点
	return wip.child;
}

/**
 * 更新Fiber根节点  注意! 这里只作为了一个连接点 即 FiberRoot -> HostRoot -> <App/>
 * 任务:
 * 1.计算状态的最新值
 * 2.创造子fiber node
 * @param {FiberNode} wip
 */
function updateHostRoot(wip: FiberNode) {
	// 对于首屏时,memoizedState是不存在的
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	// 参与计算的update
	const pending = updateQueue.shared.pending;
	// 计算完之后,之前的update就没用了
	updateQueue.shared.pending = null;
	// 计算出最终state
	// 对于初次渲染来说,这个memoizedState其实就是 render(<App/>)里面的App Element
	const { memoizedState } = processUpdateQueue(baseState, pending);
	wip.memoizedState = memoizedState;
	// 创建子FiberNode
	const nextChildren = wip.memoizedState;
	// 调度子节点
	reconcileChildren(wip, nextChildren);
	// 返回子FiberNode;
	return wip.child;
}

/**
 * 任务:创造子fiber node
 * @param {FiberNode} workInProgress
 * @return {FiberNode | null}
 */
function updateHostComponent(workInProgress: FiberNode) {
	// 对于Fiber根节点不同,Element的Fiber节点在pendingProps
	// 比如 <div><span/></div> span根节点就是div props 上的children
	const nextProps = workInProgress.pendingProps;
	const nextChildren = nextProps.children;
	// 调度子节点
	reconcileChildren(workInProgress, nextChildren);
	// 返回子节点
	return workInProgress.child;
}

/**
 * 调度子节点
 * @param {FiberNode} wip
 * @param {ReactElementType} children
 */
function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	// 获取当前显示节点
	const current = wip.alternate;
	// 这里有个优化策略,
	if (current !== null) {
		// update 比较双方节点 会被插入Placement flags
		// 对于Fiber根节点,会出发update操作,被插入Placement flags
		wip.child = reconcileChildFibers(wip, current.child, children);
	} else {
		// mount时,不追踪副作用
		// 对于Fiber子节点<App/> 在mount时,不插入Placement
		wip.child = mountChildFibers(wip, null, children);
	}
}
