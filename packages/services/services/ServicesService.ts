/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ServicesService {

    /**
     * Get all user services
     * Retrieves a list of all the user's connected services
     * @returns any Success
     * @throws ApiError
     */
    public static getAllUserServices(): CancelablePromise<{
        services?: any[];
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/service',
            errors: {
                401: `Unauthorized`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Get user services
     * Retrieves a list of the user's connected services
     * @param serviceId Service ID
     * @returns any Success
     * @throws ApiError
     */
    public static getServicesById(
        serviceId: number,
    ): CancelablePromise<{
        services?: any[];
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/service/{serviceId}',
            path: {
                'serviceId': serviceId,
            },
            errors: {
                401: `Unauthorized`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Update user service
     * Updates a user service
     * @param serviceId Service ID
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static updateService(
        serviceId: string,
        requestBody: {
            enabled?: boolean;
        },
    ): CancelablePromise<{
        services?: any[];
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/service/{serviceId}/',
            path: {
                'serviceId': serviceId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Delete user service
     * Deletes a user service
     * @param serviceId Service ID
     * @returns any Success
     * @throws ApiError
     */
    public static deleteService(
        serviceId: string,
    ): CancelablePromise<{
        services?: any[];
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/service/{serviceId}/delete',
            path: {
                'serviceId': serviceId,
            },
            errors: {
                401: `Unauthorized`,
                500: `Internal server error`,
            },
        });
    }

}