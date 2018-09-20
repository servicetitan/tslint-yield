import {helper} from './lintRunner';

const rule = 'yield';

describe('yield Rule', () => {
    describe('Void Result', () => {
        it(`shouldn't fail when having void result`, () => {
            const src = `
            yield getData();
            `;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(0);
        });
    });
    
    describe('Property Access Expressions', () => {
        it(`should fail when having access to result property`, () => {
            const src = `
            (yield getData()).result;
            `;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(1);
        });

        it(`should fail when casting result to any`, () => {
            const src = `
            ((yield getData()) as any).result;
            `;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(1);
        });

        it(`shouldn't fail when casting result to custom type`, () => {
            const src = `
            ((yield getData()) as ResultData).result;
            `;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(0);
        });
    });

    describe('Variable Statement', () => {
        it(`should fail when assigning a result`, () => {
            const src = `
            var result = yield getData();
            `;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(1);
        });

        it(`shouldn't fail when assigning a typed result`, () => {
            const src = `
            (var result = (yield getData()) as ResultData;
            `;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(0);
        });

        it(`should fail when assigning a result property`, () => {
            const src = `
            var result = (yield getData()).result;
            `;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(1);
        });

        it(`shouldn't fail when assigning a typed result property`, () => {
            const src = `
            var result = ((yield getData()) as ResultData).result;
            `;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(0);
        });
    });

    describe('Binary Expression', () => {
        it(`should fail when assigning a result`, () => {
            const src = `
            var result = null;
            result = yield getData();
            `;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(1);
        });

        it(`shouldn't fail when assigning a typed result`, () => {
            const src = `
            var result = null;
            result = (yield getData()) as ResultData;
            `;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(0);
        });

        it(`should fail when assigning a result to a property`, () => {
            const src = `
            var result = { data: null };
            result.data = yield getData();
            `;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(1);
        });

        it(`shouldn't fail when assigning a typed result to a property`, () => {
            const src = `
            var result = { data: null };
            result.data = (yield getData()) as ResultData;
            `;
            const result = helper({src, rule});
            expect(result.errorCount).toBe(0);
        });
    });
});