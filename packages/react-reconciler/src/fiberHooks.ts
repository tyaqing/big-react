import { FiberNode } from './fiber';
import internals from 'shared/internals';
import { Dispatcher } from 'react/src/currentDispatcher';
import { Dispatch } from 'react';

const { currentDispatcher } = internals;
// 当前正在渲染的Fiber节点
let currentlyRenderingFiber: FiberNode | null = null;
// 当前FC正在处理的Hook
let workInProgressHook: Hook | null = null;
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
	// 重置
	wip.memoizedState = null;

	const current = wip.alternate;
	if (current !== null) {
		// update
	} else {
		//mount
		currentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);
	// 重置
	currentlyRenderingFiber = null;
	return children;
}

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};
// 初次渲染处理State
function mountState<State>(
	initiaState: () => State | State
): State | Dispatch<State> {
	// 找到当前useState对应的hook数据
	const hook = mountWorkInProgressHook();
}

function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null
	};
	// 说明当前FC里面没有Hook节点,属于初次创建
	if (workInProgressHook === null) {
		if (currentlyRenderingFiber === null) {
			// 到了这里说明没有在函数中执行
			// 如果在函数中执行,必然会有currentlyRenderingFiber
			throw new Error('请在函数组件内调用Hook');
		} else {
			// mount时的第一个hook
			workInProgressHook = hook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		// mount时后续的hook
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}
	return workInProgressHook;
}
