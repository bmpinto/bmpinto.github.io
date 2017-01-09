var menuTrigger = document.querySelector('.menu-trigger')

menuTrigger.addEventListener('click', function() {
  this.innerText = this.classList.contains('triggered') ? 'menu' : 'fechar'

  this.classList.toggle('triggered')
})

function elementInViewport(el) {
  var rect = el.getBoundingClientRect()

  return (
    rect.top    >= 0
    && rect.left   >= 0
    && rect.top <= (window.innerHeight || document.documentElement.clientHeight)
  )
}

var lazyContainers = document.querySelectorAll('.lazy')
var containers = []

;[].forEach.call(lazyContainers, function(container) {
  return containers.push(container);
})

window.addEventListener('scroll', lazyLoadImages)

function lazyLoadImages() {
  containers.map(function(container, index) {
    if(elementInViewport(container)) {
      container.classList.add('loaded')
      containers = containers.filter(function(container) {
        return !container.classList.contains('loaded')
      })

      var imageLink = container.querySelector('.image-link')
      var containerPlaceholder = container.querySelector('img')
      var placeholderSource = containerPlaceholder.getAttribute('src')
      var imageSource = placeholderSource.replace('_small', '')
      var imageHeight = containerPlaceholder.getAttribute('data-image-height')
      var imageWidth = containerPlaceholder.getAttribute('data-image-width')
      
      var image = new Image()
      image.classList.add('original', 'image')
      image.setAttribute('src', imageSource)
      image.setAttribute('height', imageHeight)
      image.setAttribute('width', imageWidth);

      image.onload = function() {
        imageLink ? imageLink.appendChild(image) : container.appendChild(image)
        containerPlaceholder.classList.remove('is-paused')

        containerPlaceholder.addEventListener('animationend', function() {
          image.classList.add('is-relative')
          containerPlaceholder.remove()
        })
      }
    }
  })
}

