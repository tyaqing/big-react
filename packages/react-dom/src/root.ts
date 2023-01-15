import { Container } from 'hostConfig';
import {
	updateContainer,
	createContainer
} from 'react-reconciler/src/fiberReconciler';
import { ReactElementType } from 'shared/ReactTypes';

/**
 * ReactDOM.createRoot(root).render(<App/>)
 * @param {Container} container
 * @return {{render(element: ReactElementType): void}}
 */
export function createRoot(container: Container) {
	// 创建双缓存根节点
	const root = createContainer(container);
	return {
		render(element: ReactElementType) {
			// 执行首屏渲染 其本质就是去创建一根wip树
			updateContainer(element, root);
		}
	};
}
