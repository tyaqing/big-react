import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { ReactElement } from 'shared/ReactTypes';
import { createFiberFromElement, FiberNode } from './fiber';
import { Placement } from './fiberFlags';
import { HostText } from './workTags';

/**
 * 创建子Fiber节点
 * @param {boolean} shouldTrackEffect 是否追踪副作用 mount时启用优化
 * @return {(returnFiber: FiberNode, currentFirstChild: (FiberNode | null), newChild?: ReactElement) => (FiberNode | null)}
 * @constructor
 */
function ChildReconciler(shouldTrackEffect: boolean) {
	/**
	 * 根据节点类型,调度不同的节点
	 * @param {FiberNode} returnFiber 父节点
	 * @param {FiberNode | null} currentFirstChild 当前节点
	 * @param {ReactElement} newChild 子节点
	 * @return {FiberNode | null}
	 */
	function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		newChild?: ReactElement | number | string
	): FiberNode | null {
		// newChild 为 JSX
		// currentFirstChild 为 fiberNode
		if (typeof newChild === 'object' && newChild !== null) {
			// 判断节点类型
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE: {
					const fiber = reconcileSingleElement(
						returnFiber,
						currentFirstChild,
						newChild
					);
					//打上标记
					return placeSingleChild(fiber);
				}
				default: {
					if (__DEV__) console.warn('未实现的reconcile类型', newChild);
				}
			}
		}
		//TODO 多节点情况 ul=>li*3
		//文本节点
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFirstChild, newChild)
			);
		}
		if (__DEV__) console.warn('未实现的reconcile类型', newChild);

		return null;
	}
	// 处理单节点
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		element: ReactElement
	) {
		// 前：abc 后：a  删除bc
		// 前：a 后：b 删除b、创建a
		// 前：无 后：a 创建a
		console.log(currentFirstChild);
		// 根据Element创建Fiber节点
		const fiber = createFiberFromElement(element);
		// 设置新节点的父节点
		fiber.return = returnFiber;
		return fiber;
	}

	// 插入单一节点 打上placement 标记
	function placeSingleChild(fiber: FiberNode) {
		// 如果current fiber里面没有这个节点(首屏渲染),那就是新节点
		if (shouldTrackEffect && fiber.alternate === null) {
			fiber.flags |= Placement;
		}
		return fiber;
	}
	// 处理文本节点
	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null,
		content: string | number
	) {
		console.log(currentFirstChild);
		// 创建Fiber节点
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	}

	return reconcileChildFibers;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
