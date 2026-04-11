/**
 * Utilitário de compressão de imagens para reduzir tamanho antes do upload
 */

/**
 * Comprime uma imagem para reduzir o tamanho do arquivo
 * @param {File} file - Arquivo de imagem original
 * @param {Object} options - Opções de compressão
 * @returns {Promise<File>} - Promise com o arquivo comprimido
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    maxSizeMB = 1
  } = options

  return new Promise((resolve, reject) => {
    // Se o arquivo já for pequeno o suficiente, retorna sem compressão
    if (file.size <= maxSizeMB * 1024 * 1024) {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          // Calcula dimensões mantendo aspect ratio
          let { width, height } = calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          )

          canvas.width = width
          canvas.height = height

          // Desenha a imagem comprimida
          ctx.drawImage(img, 0, 0, width, height)

          // Converte para blob com qualidade especificada
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Falha na compressão da imagem'))
                return
              }

              // Se ainda for muito grande, reduz qualidade
              if (blob.size > maxSizeMB * 1024 * 1024) {
                compressWithLowerQuality(canvas, maxSizeMB, width, height)
                  .then(resolve)
                  .catch(reject)
              } else {
                // Cria novo File com o blob comprimido
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                resolve(compressedFile)
              }
            },
            'image/jpeg',
            quality
          )
        } catch (error) {
          reject(error)
        }
      }
      img.onerror = () => reject(new Error('Falha ao carregar imagem'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
    reader.readAsDataURL(file)
  })
}

/**
 * Comprime com qualidade progressivamente menor até atingir tamanho máximo
 */
const compressWithLowerQuality = (canvas, maxSizeMB, width, height) => {
  return new Promise((resolve, reject) => {
    let quality = 0.8
    
    const tryCompress = () => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falha na compressão'))
            return
          }

          if (blob.size <= maxSizeMB * 1024 * 1024 || quality <= 0.3) {
            // Se atingiu tamanho mínimo ou qualidade mínima, usa o resultado
            const compressedFile = new File([blob], 'compressed.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            // Reduz qualidade e tenta novamente
            quality -= 0.1
            tryCompress()
          }
        },
        'image/jpeg',
        quality
      )
    }
    
    tryCompress()
  })
}

/**
 * Calcula dimensões mantendo aspect ratio
 */
const calculateDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  let { width, height } = { width: originalWidth, height: originalHeight }

  // Reduz se exceder largura máxima
  if (width > maxWidth) {
    height = (maxWidth / width) * height
    width = maxWidth
  }

  // Reduz se exceder altura máxima
  if (height > maxHeight) {
    width = (maxHeight / height) * width
    height = maxHeight
  }

  return { width: Math.round(width), height: Math.round(height) }
}

/**
 * Comprime múltiplas imagens em lote
 * @param {File[]} files - Array de arquivos de imagem
 * @param {Object} options - Opções de compressão
 * @returns {Promise<File[]>} - Promise com array de arquivos comprimidos
 */
export const compressImages = async (files, options = {}) => {
  const { maxConcurrency = 3 } = options
  
  const results = []
  const chunks = []
  
  // Divide em chunks para processar em paralelo
  for (let i = 0; i < files.length; i += maxConcurrency) {
    chunks.push(files.slice(i, i + maxConcurrency))
  }
  
  // Processa cada chunk
  for (const chunk of chunks) {
    const chunkResults = await Promise.allSettled(
      chunk.map(file => compressImage(file, options))
    )
    
    // Adiciona apenas os successful results
    chunkResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        console.warn(`Falha na compressão da imagem ${chunk[index].name}:`, result.reason)
        // Adiciona arquivo original se compressão falhar
        results.push(chunk[index])
      }
    })
  }
  
  return results
}

/**
 * Valida se arquivo é uma imagem suportada
 * @param {File} file - Arquivo para validar
 * @returns {boolean} - True se for imagem suportada
 */
export const isSupportedImage = (file) => {
  return file.type.match(/^image\/(jpeg|png|jpg|gif)$/)
}

/**
 * Obtém informações sobre o arquivo de imagem
 * @param {File} file - Arquivo de imagem
 * @returns {Promise<Object>} - Informações da imagem
 */
export const getImageInfo = (file) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height,
        size: file.size,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2),
        type: file.type,
        name: file.name
      })
    }
    img.onerror = () => {
      resolve({
        width: 0,
        height: 0,
        aspectRatio: 0,
        size: file.size,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2),
        type: file.type,
        name: file.name,
        error: true
      })
    }
    img.src = URL.createObjectURL(file)
  })
}
