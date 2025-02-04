export const courseConfig = {
    id: 'course_1',
    title: 'Web & APP Course',
    originalPrice: 150000,
    discountPrice: 99000,
    discountPercent: 34,
    currency: '₩',
  }
  
  export const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }