var menuTrigger = document.querySelector('.menu-trigger')

menuTrigger.addEventListener('click', function() {
  this.innerText = this.classList.contains('triggered') ? 'menu' : 'fechar'
  this.classList.toggle('triggered')
})

function elementInViewport(element) {
  var rect = element.getBoundingClientRect()

  return (
    rect.top >= 0 && rect.left >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight)
  )
}

function setImageAttributes(placeholder) {
  return {
    source: placeholder.getAttribute('data-image-source'),
    height: placeholder.getAttribute('data-image-height'),
    width: placeholder.getAttribute('data-image-width')
  }
}

function getImageAttributes(attributes) {
  var image = new Image()

  image.classList.add('original', 'image')
  image.setAttribute('src', attributes.source)
  image.setAttribute('height', attributes.height)
  image.setAttribute('width', attributes.width)

  return image;
}

function createImage(placeholder) {
  var imageAttributes = setImageAttributes(placeholder)
  return getImageAttributes(imageAttributes)
}

// remove containers already loaded
function filterContainers(containersArray, currentContainer) {
  currentContainer.classList.add('loaded')
  return containersArray.filter(function(container) {
    return !container.classList.contains('loaded')
  })
}

// remove placeholder image after animation
function animate(image, placeholder) {
  placeholder.parentNode.appendChild(image)
  placeholder.classList.remove('is-paused')

  placeholder.addEventListener('animationend', function() {
    image.classList.add('is-relative')
    placeholder.remove()
  })
}

function lazyLoadImages() {
  lazyContainers.map(function(currentContainer) {
    if(elementInViewport(currentContainer)) {
      var placeholder = currentContainer.querySelector('img')
      var image = createImage(placeholder)

      lazyContainers = filterContainers(lazyContainers, currentContainer)

      image.onload = function () {
        placeholder.parentNode.appendChild(image)
        placeholder.classList.remove('is-paused')

        placeholder.addEventListener('animationend', function() {
          image.classList.add('is-relative')
          placeholder.remove()
        })
      }
    }
  })
}

var lazy = document.querySelectorAll('.lazy')
var lazyContainers = []
;[].forEach.call(lazy, function(container) {
  return lazyContainers.push(container)
})
window.addEventListener('scroll', lazyLoadImages)