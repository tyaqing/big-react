export type Container = Element | Document;
export type Instance = Element;
export type TextInstance = Text;

export const createInstance = (...args: any) => {
	return {} as any;
};

export const createTextInstance = (...args: any) => {
	return {} as any;
};

export const appendInitialChild = (...args: any) => {
	return {} as any;
};

export const appendChildToContainer = (
	child: Instance,
	container: Container
) => {
	container.appendChild(child);
};
