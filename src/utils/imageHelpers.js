/**
 * Utilitários para manipulação de imagens de produtos
 */

/**
 * Obtém a URL base para imagens
 * @returns {string} - URL base para imagens
 */
const getImageBaseUrl = () => {
  return import.meta.env.VITE_API_URL.replace('/api', '/')
}

/**
 * Constrói URL completa da imagem
 * @param {string} imagePath - Path da imagem
 * @returns {string} - URL completa da imagem
 */
export const buildImageUrl = (imagePath) => {
  if (!imagePath) return ''
  return getImageBaseUrl() + imagePath
}

/**
 * Obtém a imagem principal de um produto (sort_order: 1)
 * @param {Object} product - Objeto do produto
 * @returns {Object|null} - Imagem principal ou null
 */
export const getPrimaryImage = (product) => {
  if (!product?.images || !Array.isArray(product.images)) {
    return null
  }
  
  // Procura por imagem com sort_order: 1
  const primaryImage = product.images.find(img => img.sort_order === 1)

  // Se não encontrar, usa a primeira imagem
  if (!primaryImage && product.images.length > 0) {
    return product.images[0]
  }
  
  return primaryImage
}

/**
 * Obtém a URL da imagem principal de um produto
 * @param {Object} product - Objeto do produto
 * @returns {string} - URL da imagem principal ou fallback
 */
export const getPrimaryImageUrl = (product) => {
  const primaryImage = getPrimaryImage(product)
  
  if (primaryImage?.image_path) {
    return buildImageUrl(primaryImage.image_path)
  }
  
  return ''
}

/**
 * Obtém todas as URLs de imagens de um produto ordenadas
 * @param {Object} product - Objeto do produto
 * @returns {Array} - Array de URLs ordenadas
 */
export const getAllImageUrls = (product) => {
  if (!product?.images || !Array.isArray(product.images)) {
    // Fallback para sistemas antigos
    const fallbackUrl = getPrimaryImageUrl(product)
    return fallbackUrl ? [fallbackUrl] : []
  }
  
  // Ordena por sort_order
  const sortedImages = [...product.images].sort((a, b) => a.sort_order - b.sort_order)
  
  return sortedImages
    .map(img => img.image_path)
    .filter(path => path)
    .map(path => buildImageUrl(path))
}

/**
 * Verifica se um produto tem imagens
 * @param {Object} product - Objeto do produto
 * @returns {boolean} - True se tem imagens
 */
export const hasImages = (product) => {
  return !!(product?.images && product.images.length > 0) || 
         !!(product?.image_path)
}

/**
 * Conta quantas imagens um produto tem
 * @param {Object} product - Objeto do produto
 * @returns {number} - Número de imagens
 */
export const getImageCount = (product) => {
  if (product?.images && Array.isArray(product.images)) {
    return product.images.length
  }
  
  // Fallback para sistemas antigos
  return product?.image_path ? 1 : 0
}
