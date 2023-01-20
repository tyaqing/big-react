import { FiberNode } from './fiber';
import internals from 'shared/internals';

const { currentDispatcher } = internals;
// 当前正在渲染的Fiber节点
let currentlyRenderingFiber: FiberNode | null = null;
// 当前FC正在处理的Hook
const workInProgressHook: Hook | null = null;
interface Hook {
	// 这里需要注意的是,FiberNode自己有一个memoizedState 是指向Hook(比如useState)的
	// Hook(比如useState)的memoizedState是指向hook数据的
	memoizedState: any;
	updateQueue: unknown;
	next: Hook | null;
}
/**
 * 返回函数组件的children
 * @param {FiberNode} wip
 * @return {any}
 */
export function renderWithHooks(wip: FiberNode) {
	// 设置正在渲染的节点
	currentlyRenderingFiber = wip;
	wip.memoizedState = null;

	const current = wip.alternate;
	if (current !== null) {
		// update
	} else {
		//mount
		currentDispatcher.current = null;
	}

	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);
	// 重置
	currentlyRenderingFiber = null;
	return children;
}
