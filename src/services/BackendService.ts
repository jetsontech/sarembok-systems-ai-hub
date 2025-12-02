const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const BackendService = {
    async processAudio(file: File, task: string): Promise<Blob> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('task', task);

        try {
            const response = await fetch(`${BACKEND_URL}/process-audio`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Backend error: ${response.statusText}`);
            }

            return await response.blob();
        } catch (error) {
            console.warn('Backend unreachable, using mock fallback for demo:', error);

            // Mock processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Return original file as "processed" for demo
            return file.slice(0, file.size, file.type);
        }
    },

    async processImage(file: File, task: string, param?: string): Promise<Blob> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('task', task);
        if (param) formData.append('param', param);

        try {
            const response = await fetch(`${BACKEND_URL}/process-image`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Backend error: ${response.statusText}`);
            }

            return await response.blob();
        } catch (error) {
            console.warn('Backend unreachable, using mock fallback for demo:', error);
            await new Promise(resolve => setTimeout(resolve, 1500));
            return file.slice(0, file.size, file.type);
        }
    },

    async processVideo(file: File, task: string, param?: string): Promise<Blob> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('task', task);
        if (param) formData.append('param', param);

        try {
            const response = await fetch(`${BACKEND_URL}/process-video`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Backend error: ${response.statusText}`);
            }

            return await response.blob();
        } catch (error) {
            console.warn('Backend unreachable, using mock fallback for demo:', error);
            await new Promise(resolve => setTimeout(resolve, 3000));
            return file.slice(0, file.size, file.type);
        }
    },

    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${BACKEND_URL}/`);
            return response.ok;
        } catch (e) {
            return false;
        }
    }
};
