// first add raf shim
// http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60)
          }
})()

// main function
function scrollToY(scrollTargetY, offset) {
  var scrollY = window.scrollY || document.documentElement.scrollTop
  var scrollTargetY = scrollTargetY || 0
  var currentTime = 0
  var time = Math.max(.1, Math.min(Math.abs(scrollY - scrollTargetY), .4))

  // easing equations from https://github.com/danro/easing-js/blob/master/easing.js
  // add animation loop
  function tick() {
    currentTime += 1 / 60

    var p = currentTime / time
    var t = -0.5 * (Math.cos(Math.PI * p) - 1)

    if (p < 1) {
      requestAnimFrame(tick)
      window.scrollTo(0, scrollY + ((scrollTargetY - scrollY) * t))
    } else
      window.scrollTo(0, scrollTargetY)
  }

  tick()
}

function scrollToSection(elementRef) {
  var siteHeader = document.querySelector('.site-header')
  var siteHeaderStyle = window.getComputedStyle(siteHeader, null)
  var siteHeaderHeight = siteHeaderStyle.getPropertyValue('height')
  var parsetSiteHeaderHeight = parseInt(siteHeaderHeight, 10)
  var element = document.querySelector(elementRef)
  var elementStyle = window.getComputedStyle(element, null)
  var elementOffset = elementStyle.getPropertyValue('padding-top')
  var elementContainer = element.querySelector('.container')
  var parsedElementOffset = parseInt(elementOffset, 10)
  var totalOffset = elementContainer.offsetTop - parsetSiteHeaderHeight - parsedElementOffset
  scrollToY(totalOffset)
}

var menuItems = document.querySelectorAll('.main-nav a')
;[].forEach.call(menuItems, function(item){
  item.addEventListener('click', function(e) {
    e.preventDefault()
    var itemRef = item.getAttribute('href')
    scrollToSection(itemRef)
    window.location.hash = itemRef
  })
})

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

function setImageAttributes(placeholder, source) {
  var hoverSource = placeholder.getAttribute('data-image-hover-source')
  var originalSource = placeholder.getAttribute('data-image-source')
  var imageSource = source ? hoverSource : originalSource

  return {
    source: imageSource,
    height: placeholder.getAttribute('data-image-height'),
    width: placeholder.getAttribute('data-image-width')
  }
}

function getImageAttributes(attributes, source) {
  var image = new Image()
  var imageClass = source ? source : 'original'

  image.classList.add(imageClass, 'image')
  image.setAttribute('src', attributes.source)
  image.setAttribute('height', attributes.height)
  image.setAttribute('width', attributes.width)

  return image
}

function canCreateSourceImage(image, source) {
  return image.getAttribute('data-image-' + source + '-source')
}

function createImage(placeholder, source) {
  if(source && !canCreateSourceImage(placeholder, source))
    return

  var imageAttributes = setImageAttributes(placeholder, source)
  return getImageAttributes(imageAttributes, source)
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
      var hoverImage = createImage(placeholder, 'hover')

      lazyContainers = filterContainers(lazyContainers, currentContainer)

      image.onload = function () {
        placeholder.parentNode.appendChild(image)
        placeholder.classList.remove('is-paused')

        if(hoverImage)
          placeholder.parentNode.appendChild(hoverImage)

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

