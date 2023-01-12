import { Container } from './hostConfig';
import {
	updateContainer,
	createContainer
} from 'react-reconciler/src/fiberReconciler';
import { ReactElement } from 'shared/ReactTypes';

export function createRoot(container: Container) {
	// 创建双缓存跟节点
	const root = createContainer(container);
	return {
		render(element: ReactElement) {
			// 执行首屏渲染
			updateContainer(element, root);
		}
	};
}
