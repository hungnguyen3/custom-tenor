export interface CollectionDTO {
	collectionId: number;
	collectionName: string;
	private: boolean;
}

export interface CreateCollectionDTO {
	data: CollectionDTO;
}

export interface DeleteCollectionDTO {
	data: { successMessage: string };
}

export interface UpdateCollectionByIdDTO {
	data: CollectionDTO;
}

export interface GetCollectionsByUserIdDTO {
	data: CollectionDTO[];
}