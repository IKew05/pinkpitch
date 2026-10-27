/**
 * ย่อและครอบตัดรูปภาพเป็นสี่เหลี่ยมจัตุรัสสำหรับ Avatar (Data URL)
 * @param {File} file
 * @param {number} size
 * @returns {Promise<string>}
 */
export function processAvatarFile(file, size = 200) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('กรุณาเลือกไฟล์รูปภาพเท่านั้น'))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('ไม่สามารถประมวลผลรูปภาพได้'))
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')

        // Center crop to square
        const minDim = Math.min(img.width, img.height)
        const sx = (img.width - minDim) / 2
        const sy = (img.height - minDim) / 2

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.88))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
