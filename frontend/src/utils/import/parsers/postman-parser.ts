import { ImportResult } from '../types';

/**
 * Parser untuk Postman Collection v2.1 format
 * Mengekstrak collections, endpoints, dan environment variables dari file Postman
 */
export const parsePostmanCollection = async (content: string): Promise<ImportResult> => {
  try {
    const parsed = JSON.parse(content);

    // Validasi schema Postman
    if (!parsed.info || !parsed.info.name) {
      throw new Error('Format Postman collection tidak valid - harus ada info.name');
    }

    if (!parsed.item || !Array.isArray(parsed.item)) {
      throw new Error('Format Postman collection tidak valid - harus ada array item');
    }

    const collections = parsed.item || [];
    const environments = parsed.variable || [];

    // Transformasi data Postman ke format internal
    const transformedData = {
      type: 'postman' as const,
      name: parsed.info.name,
      description: parsed.info?.description || '',
      info: parsed.info,
      collections: collections.map((item: any, index: number) => ({
        id: `collection_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`,
        name: item.name || `Collection ${index + 1}`,
        description: item.description || '',
        request: item.request,
        item: item.item ?
          item.item
            .filter((subItem: any) => subItem.request)
            .map((endpoint: any, endpointIndex: number) => ({
              id: `endpoint_${Date.now()}_${endpointIndex}_${Math.random().toString(36).substr(2, 6)}`,
              name: endpoint.name || `Request ${endpointIndex + 1}`,
              method: endpoint.request?.method || 'GET',
              url: endpoint.request?.url?.raw || endpoint.request?.url || '',
              headers: endpoint.request?.header?.reduce((acc: Record<string, string>, header: any) => {
                if (header.key && header.value && !header.disabled) {
                  acc[header.key] = header.value;
                }
                return acc;
              }, {}) || {},
              body: endpoint.request?.body?.raw || '',
              params: endpoint.request?.url?.query?.reduce((acc: Record<string, string>, param: any) => {
                if (param.key && !param.disabled) {
                  acc[param.key] = param.value || '';
                }
                return acc;
              }, {}) || {},
              description: endpoint.request?.description || ''
            }))
          : []
      }))
    };

    const totalEndpoints = collections.reduce((total: number, collection: any) =>
      total + (collection.item?.length || 0), 0);

    return {
      success: true,
      message: `Berhasil import "${parsed.info.name}" dengan ${collections.length} collection dan ${totalEndpoints} endpoint`,
      data: transformedData,
      importedCount: totalEndpoints,
      warnings: environments.length > 0 ? [
        `Ditemukan ${environments.length} environment variables yang tidak diimport`
      ] : []
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Gagal parse Postman collection: ${error.message}`,
      warnings: ['Pastikan file adalah Postman Collection v2.1 format yang valid']
    };
  }
};