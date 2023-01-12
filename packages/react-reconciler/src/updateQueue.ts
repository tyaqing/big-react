import { Action } from 'shared/ReactTypes';

// State在这类是个泛型T
export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		// 环形链表
		pending: Update<State> | null;
	};
}

// 创建
export const createUpdate = <State>(action: Action<State>) => {
	return {
		action
	};
};

// 插入
export const enqueueUpdate = <Action>(
	updateQueue: UpdateQueue<Action>, // 被插入的Queue
	update: Update<Action> // 某个update
) => {
	updateQueue.shared.pending = update;
};

// 初始化
export const createUpdateQueue = <Action>() => {
	const updateQueue: UpdateQueue<Action> = {
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
