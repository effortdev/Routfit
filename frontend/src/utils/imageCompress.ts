// 업로드 전 브라우저에서 이미지를 리사이즈 + JPEG 압축해서 전송 용량을 줄임
// (카카오톡이 사진 보낼 때 자동으로 용량 줄이는 것과 같은 목적)
export async function compressImage(file: File, maxDimension = 1280, quality = 0.82): Promise<File> {
    if (!file.type.startsWith('image/')) return file

    try {
        const bitmap = await createImageBitmap(file)
        let { width, height } = bitmap

        if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return file

        ctx.drawImage(bitmap, 0, 0, width, height)

        const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
        if (!blob) return file

        const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
        // 압축 결과가 오히려 더 크면(이미 작은 이미지였던 경우) 원본 그대로 사용
        return compressed.size < file.size ? compressed : file
    } catch {
        // 브라우저가 createImageBitmap을 지원 안 하거나 실패하면 원본 그대로 업로드
        return file
    }
}