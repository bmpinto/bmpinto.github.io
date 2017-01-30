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
function scrollToY(scrollTargetY, elementRef) {
  var scrollY = window.scrollY || document.documentElement.scrollTop
  var scrollTargetY = scrollTargetY || 0
  var currentTime = 0
  var time = Math.max(.1, Math.min(Math.abs(scrollY - scrollTargetY), .6))

  // easing equations from https://github.com/danro/easing-js/blob/master/easing.js
  // add animation loop
  function tick() {
    currentTime += 1 / 60

    var p = currentTime / time
    var t = -0.5 * (Math.cos(Math.PI * p) - 1)

    if (p < 1) {
      requestAnimFrame(tick)
      window.scrollTo(0, scrollY + ((scrollTargetY - scrollY) * t))
    } else {
      window.scrollTo(0, scrollTargetY)
      if(elementRef) {
        var el = document.getElementById(elementRef.replace('#',''));
        var id = el.id;
        el.removeAttribute('id');
        window.location.hash = elementRef;
        el.setAttribute('id',id);
      }
    }
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
  scrollToY(totalOffset, elementRef)
}

function closest(el, selector) {
  var matchesSelector =
    el.matches
    || el.webkitMatchesSelector
    || el.mozMatchesSelector
    || el.msMatchesSelector

  while (el) {
    if (matchesSelector.call(el, selector))
      break
    el = el.parentElement
  }

  return el
}

function elementInViewport(element) {
  var rect = element.getBoundingClientRect()
  var closestElement = closest(element, '.section')
  var previousSibling =  closestElement.previousElementSibling
  var offset = previousSibling ? previousSibling.offsetTop : 0

  return rect.top >= 0 && rect.left >= 0 &&
    rect.top - offset <= (window.innerHeight || document.documentElement.clientHeight)
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

function scroll() {
  lazyLoadImages()

  var siteHeader = document.querySelector('.site-header')
  var siteHeaderStyle = window.getComputedStyle(siteHeader, null)
  var siteHeaderHeight = parseInt(siteHeaderStyle.getPropertyValue('height'), 10)
  var mainNav = document.querySelector('.main-nav')
  var fromTop = (document.documentElement.scrollTop || document.body.scrollTop) + siteHeaderHeight + 1
  var currentSectionId = scrollItems.filter(function(item) {
    if(item.offsetTop < fromTop)
      return item.id
  })

  if(window.innerHeight + window.scrollY === document.documentElement.offsetHeight) {
    var item = mainNav.querySelector('a:last-child')
    var itemRef = item.getAttribute('href')
    currentSectionId.push(document.querySelector(itemRef))
  }

  if(! currentSectionId.length) {
    var actives = mainNav.querySelectorAll('.active')
    ;[].forEach.call(actives, function(active) {
        active.classList.remove('active')
    })
    return
  }

  currentSectionId = currentSectionId[currentSectionId.length - 1]
  
  var id = currentSectionId.id
  var lastId
  
  if(lastId !== id) {
    lastId = id
    var el = mainNav.querySelector('[href="#'+ id +'"]')
    el.classList.add('active')
    var actives = mainNav.querySelectorAll('.active')
    ;[].forEach.call(actives, function(active) {
      if(active != el)
        active.classList.remove('active')
    })
  }
}

document.querySelector('#logo').addEventListener('click', function(item) {
  scrollToY(0)
})
var lazy = document.querySelectorAll('.lazy')
var menuItems = document.querySelectorAll('.main-nav a')
var menuTrigger = document.querySelector('.menu-trigger')
var lazyContainers = []
var scrollItems = []

;[].forEach.call(menuItems, function(item){
  var itemRef = item.getAttribute('href')
  scrollItems.push(document.querySelector(itemRef))
})

;[].forEach.call(lazy, function(container) {
  return lazyContainers.push(container)
})

;[].forEach.call(menuItems, function(item){
  item.addEventListener('click', function(e) {
    e.preventDefault()
    var itemRef = item.getAttribute('href')
    scrollToSection(itemRef)
  })
})

menuTrigger.addEventListener('click', function() {
  this.innerText = this.classList.contains('triggered') ? 'menu' : 'fechar'
  this.classList.toggle('triggered')
})

window.addEventListener('scroll', scroll)
window.addEventListener('load', lazyLoadImages)

var statements = document.querySelectorAll('.statement')
var statementsNav = document.querySelectorAll('.testimonials-nav li')
var statementsLength = statements.length - 1
var index = 1

var carousel = setInterval(function () {
  ;[].forEach.call(statements, function(statement) {
    statement.classList.remove('is-active')
  })

  ;[].forEach.call(statementsNav, function(statement) {
    statement.classList.remove('is-active')
  })

  if(index === statementsLength + 1)
    index = 0

  statements[index].classList.add('is-active')
  statementsNav[index].classList.add('is-active')

  index++
}, 5000)

;[].forEach.call(statementsNav, function(statement) {
  statement.addEventListener('click', function() {
    var statementIndex = statement.getAttribute('data-statement-index')
    clearTimeout(carousel)
    
    ;[].forEach.call(statements, function(statement) {
      statement.classList.remove('is-active')
    })

    ;[].forEach.call(statementsNav, function(statement) {
      statement.classList.remove('is-active')
    })

    statements[statementIndex].classList.add('is-active')
    statement.classList.add('is-active')
  })
})