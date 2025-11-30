import type { UploadModel } from "@be/upload/model/upload.model";

export namespace UploadTypes {
	export type UploadResponse = typeof UploadModel.uploadResponse.static;
	export type UploadListResponse = typeof UploadModel.uploadListResponse.static;
	export type UploadQuery = typeof UploadModel.uploadQuery.static;
	export type FileNotFound = typeof UploadModel.fileNotFound.static;
	export type Unauthorized = typeof UploadModel.unauthorized.static;
	export type ValidationError = typeof UploadModel.validationError.static;
	export type FileTooLarge = typeof UploadModel.fileTooLarge.static;
	export type InvalidFileType = typeof UploadModel.invalidFileType.static;

	// Backend types with Date objects
	export interface UploadData {
		id: string;
		filename: string;
		originalName: string;
		mimeType: string;
		size: number;
		path: string;
		userId: string;
		deletedAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
	}
}
