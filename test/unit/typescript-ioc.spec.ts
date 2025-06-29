import { IoCContainer } from "../../src/container/container";
import { BuildContext, ValueConfig } from "../../src/model";
import {
	Config,
	Container,
	ObjectFactory,
	Scope,
} from "../../src/typescript-ioc";

jest.mock("../../src/container/container");
const mockBind = IoCContainer.bind as jest.Mock;
const mockBindName = IoCContainer.bindName as jest.Mock;
const mockGet = IoCContainer.get as jest.Mock;
const mockGetType = IoCContainer.getType as jest.Mock;
const mockSnapshot = IoCContainer.snapshot as jest.Mock;
const mockNamespace = IoCContainer.namespace as jest.Mock;
const mockSelectedNamespace = IoCContainer.selectedNamespace as jest.Mock;

const mockTo = jest.fn();
const mockFactory = jest.fn();
const mockScope = jest.fn();
const mockWithParams = jest.fn();
let bindResult: Config;
let bindNameResult: ValueConfig;

describe("Container", () => {
	beforeAll(() => {
		bindResult = {
			to: mockTo,
			factory: mockFactory,
			scope: mockScope,
			withParams: mockWithParams,
		};
		bindNameResult = {
			to: mockTo,
		};
	});

	beforeEach(() => {
		mockGet.mockClear();
		mockGetType.mockClear();
		mockSnapshot.mockClear();
		mockNamespace.mockClear();
		mockSelectedNamespace.mockClear();
		mockTo.mockClear();
		mockFactory.mockClear();
		mockScope.mockClear();
		mockWithParams.mockClear();
		mockBind.mockClear();
		mockBindName.mockClear();
		mockBind.mockReturnValue(bindResult);
		mockBindName.mockReturnValue(bindNameResult);
	});

	class MyBaseType {}
	class MyType extends MyBaseType {}
	const MyFactory: ObjectFactory = () => new MyType();

	it("should get an instance for a type bound to the container", () => {
		const bind = Container.bind(MyBaseType);

		expect(mockBind).toHaveBeenCalledWith(MyBaseType);
		expect(bind).toStrictEqual(bindResult);
	});

	it("should get an instance for a type bound to the container", () => {
		const value = { value: "value" };
		mockGet.mockReturnValue(value);
		const object = Container.get(MyBaseType);

		expect(mockGet).toHaveBeenCalledWith(MyBaseType, expect.any(BuildContext));
		expect(object).toStrictEqual(value);
	});

	it("should get a type bound with a source type from the container", () => {
		const value = { value: "value" };
		mockGetType.mockReturnValue(value);
		const object = Container.getType(MyBaseType);

		expect(mockGetType).toHaveBeenCalledWith(MyBaseType);
		expect(object).toStrictEqual(value);
	});

	it("should create a config snapshot for the container", () => {
		const value = { value: "value" };
		mockSnapshot.mockReturnValue(value);
		const object = Container.snapshot();

		expect(mockSnapshot).toHaveBeenCalledTimes(1);
		expect(object).toStrictEqual(value);
	});

	it("should create a namespace in the container", () => {
		const value = { value: "value" };
		mockNamespace.mockReturnValue(value);
		const object = Container.namespace("name");

		expect(mockNamespace).toHaveBeenCalledTimes(1);
		expect(mockNamespace).toHaveBeenCalledWith("name");
		expect(object).toStrictEqual(value);
	});

	it("should create a namespace in the container using environment alias", () => {
		const value = { value: "value" };
		mockNamespace.mockReturnValue(value);
		const object = Container.environment("name");

		expect(mockNamespace).toHaveBeenCalledTimes(1);
		expect(mockNamespace).toHaveBeenCalledWith("name");
		expect(object).toStrictEqual(value);
	});

	describe("configure()", () => {
		it("should configure the IoC Container", () => {
			Container.configure({ bind: MyBaseType, to: MyType });

			expect(mockTo).toHaveBeenCalledWith(MyType);
			expect(mockFactory).not.toHaveBeenCalled();
			expect(mockScope).not.toHaveBeenCalled();
			expect(mockWithParams).not.toHaveBeenCalled();
		});

		it("should configure the IoC Container using a provider", () => {
			Container.configure({ bind: MyBaseType, factory: MyFactory });

			expect(mockTo).not.toHaveBeenCalled();
			expect(mockFactory).toHaveBeenCalledWith(MyFactory);
		});

		it("should configure the IoC Container to use a custom scope", () => {
			Container.configure({ bind: MyBaseType, scope: Scope.Singleton });

			expect(mockTo).not.toHaveBeenCalled();
			expect(mockFactory).not.toHaveBeenCalled();
			expect(mockScope).toHaveBeenCalledWith(Scope.Singleton);
		});

		it("should configure the IoC Container to build instances with params", () => {
			Container.configure({ bind: MyBaseType, withParams: ["param"] });

			expect(mockWithParams).toHaveBeenCalledWith(["param"]);
		});

		it("should configure constants in the IoC Container", () => {
			Container.configure({ bindName: "myProp", to: "a value" });

			expect(mockBindName).toHaveBeenCalledWith("myProp");
			expect(mockTo).toHaveBeenCalledWith("a value");
		});

		it("should apply configurations to specific namespaces", () => {
			mockSelectedNamespace.mockReturnValue("otherNamespace");

			Container.configure({
				namespace: { test: [{ bindName: "myProp", to: "a value" }] },
			});

			expect(mockSelectedNamespace).toHaveBeenCalledTimes(1);
			expect(mockNamespace).toHaveBeenCalledWith("test");
			expect(mockBindName).toHaveBeenCalledWith("myProp");
			expect(mockTo).toHaveBeenCalledWith("a value");
			expect(mockNamespace).toHaveBeenCalledWith("otherNamespace");
		});

		it("should apply configurations to specific environment", () => {
			mockSelectedNamespace.mockReturnValue("otherNamespace");

			Container.configure({
				env: { test: [{ bindName: "myProp", to: "a value" }] },
			});

			expect(mockSelectedNamespace).toHaveBeenCalledTimes(1);
			expect(mockNamespace).toHaveBeenCalledWith("test");
			expect(mockBindName).toHaveBeenCalledWith("myProp");
			expect(mockTo).toHaveBeenCalledWith("a value");
			expect(mockNamespace).toHaveBeenCalledWith("otherNamespace");
		});
	});
});
