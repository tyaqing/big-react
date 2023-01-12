import { Action } from 'shared/ReactTypes';

// 更新队列,为fiber上的一个属性
export interface UpdateQueue<State> {
	shared: {
		// 环形链表
		pending: Update<State> | null;
	};
}
// State在这类是个泛型T
// Update是UpdateQueue里面的一个子单元
export interface Update<State> {
	action: Action<State>;
}

// 创建
export const createUpdate = <State>(action: Action<State>) => {
	return {
		action
	};
};

/**
 * 将更新子单元放入队列中
 * @param {UpdateQueue<Action>} updateQueue
 * @param {Update<Action>} update
 */
export const enqueueUpdate = <Action>(
	updateQueue: UpdateQueue<Action>, // 被插入的Queue
	update: Update<Action> // 某个update
) => {
	updateQueue.shared.pending = update;
};

// 初始化
export const createUpdateQueue = <Action>() => {
	const updateQueue: UpdateQueue<Action> = {
		// 这里的share设计,可以让curren 和 workInProgress 共用同一个
		shared: {
			pending: null
		}
	};
	return updateQueue;
};

// 消费
export const processUpdateQueue = <State>(
	baseState: State,
	pendingState: Update<State> | null
): { memoizedState: State } => {
	// 返回的状态数据
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};
	// 处理update
	if (pendingState !== null) {
		const action = pendingState.action;
		if (action instanceof Function) {
			// 比如baseState为 1 setState(x=>4x) memoizedState:4
			result.memoizedState = action(baseState);
		} else {
			// 比如baseState为 1 setState(3) memoizedState:3
			result.memoizedState = action;
		}
	}
	return result;
};
