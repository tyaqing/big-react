import { FiberNode } from './fiber';

/**
 * 返回函数组件的children
 * @param {FiberNode} wip
 * @return {any}
 */
export function renderWithHooks(wip: FiberNode) {
	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);
	return children;
}
