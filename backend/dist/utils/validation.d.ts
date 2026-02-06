import Joi from 'joi';
export declare const schemas: {
    register: Joi.ObjectSchema<any>;
    login: Joi.ObjectSchema<any>;
    prediction: Joi.ObjectSchema<any>;
    match: Joi.ObjectSchema<any>;
};
export declare const validateRequest: (schema: Joi.Schema) => (req: any, res: any, next: any) => any;
//# sourceMappingURL=validation.d.ts.map