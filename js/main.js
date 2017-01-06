var menuTrigger = document.querySelector('.menu-trigger')
var menu = document.querySelector('.menu')

menuTrigger.addEventListener('click', function() {
  this.innerText = this.classList.contains('triggered') ? 'menu' : 'fechar'

  this.classList.toggle('triggered')
})

var portfolioBlurredImages = document.querySelectorAll('.portfolio .image.is-blurred')

setTimeout(function() {
  [].forEach.call(portfolioBlurredImages, function(image) {
    var originalImage = document.createElement('img')
    var originalImageName = image.src.split('_small')[0]
    var originalImageExtension = image.src.split('_small')[1]

    originalImage.classList.add('original', 'image')
    originalImage.setAttribute('src',  originalImageName + originalImageExtension)
    originalImage.setAttribute('height', '261')
    originalImage.setAttribute('width', '333')

    image.parentNode.insertBefore(originalImage, image.nextSibling)

    image.classList.remove('is-paused')
  });
}, 1000)