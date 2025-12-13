import {
    TEMPLATE_ERROR_CODES,
    type TemplateErrorCode,
} from "../template.error-code";

export class TemplateError extends Error {
    public readonly code: TemplateErrorCode;
    public readonly statusCode: number;

    constructor(
        code: TemplateErrorCode,
        message: string,
        statusCode: number = 400,
    ) {
        super(message);
        this.name = "TemplateError";
        this.code = code;
        this.statusCode = statusCode;
    }

    static notFound(id: string): TemplateError {
        return new TemplateError(
            TEMPLATE_ERROR_CODES.TEMPLATE_NOT_FOUND,
            `Template with id "${id}" not found`,
            404,
        );
    }

    static nameRequired(): TemplateError {
        return new TemplateError(
            TEMPLATE_ERROR_CODES.TEMPLATE_NAME_REQUIRED,
            "Template name is required",
            400,
        );
    }

    static invalidContent(reason: string): TemplateError {
        return new TemplateError(
            TEMPLATE_ERROR_CODES.TEMPLATE_CONTENT_INVALID,
            `Invalid template content: ${reason}`,
            400,
        );
    }

    static unauthorized(): TemplateError {
        return new TemplateError(
            TEMPLATE_ERROR_CODES.UNAUTHORIZED,
            "Authentication required",
            401,
        );
    }

    static forbidden(): TemplateError {
        return new TemplateError(
            TEMPLATE_ERROR_CODES.FORBIDDEN,
            "You do not have permission to perform this action",
            403,
        );
    }

    static renderFailed(reason: string): TemplateError {
        return new TemplateError(
            TEMPLATE_ERROR_CODES.TEMPLATE_RENDER_FAILED,
            `Failed to render template: ${reason}`,
            500,
        );
    }

    static versionNotFound(templateId: string, version: number): TemplateError {
        return new TemplateError(
            TEMPLATE_ERROR_CODES.TEMPLATE_VERSION_NOT_FOUND,
            `Version ${version} not found for template "${templateId}"`,
            404,
        );
    }
}
