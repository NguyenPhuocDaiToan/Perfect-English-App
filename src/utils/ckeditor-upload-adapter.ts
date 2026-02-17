
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { FileService } from '../services/file.service';

export class CustomUploadAdapter {
    constructor(
        private loader: any,
        private fileService: FileService,
    ) { }

    async upload() {
        try {
            const file = await this.loader.file;
            console.log('Uploading file:', file);

            // ✅ Chuyển Observable -> Promise để thật sự gọi API
            const res: any = await firstValueFrom(this.fileService.uploadFile(file));

            console.log('Upload response:', res);
            return {
                default: environment.urlBaseImage + res.url, // CKEditor cần object có field "default"
            };
        } catch (err) {
            console.error('Upload error:', err);
            throw err;
        }
    }

    abort() {
        // Nếu bạn muốn hủy upload, có thể xử lý ở đây
    }
}
