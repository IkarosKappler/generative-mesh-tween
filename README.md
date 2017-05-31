A Generative 2D Mesh Tweening Test (II)
======================================

Written in Javascript (with HTML5 Canvas).


![Generative Mesh Tweening Test II](generative-mesh-tween-deviation-0.png)

![Generative Mesh Tweening Test II](generative-mesh-tween-deviation-0-1.png)

![Generative Mesh Tweening Test II](generative-mesh-tween-deviation-0-2.png)

![Generative Mesh Tweening Test II](generative-mesh-tween-deviation-0-3.png)

![Generative Mesh Tweening Test II](generative-mesh-tween-deviation-2-cubic.png)

![Generative Mesh Tweening Test II](generative-mesh-tween-random-0.png)

![Generative Mesh Tweening Test II](generative-mesh-tween-drag-centroid-0.png)


Demo at http://www.int2byte.de/public/generative-mesh-tween/main.html


Note: The application has timing issues as it does not use the requestAnimationFrame API.
      On slow systems the graphics may render with gaps (time gaps = graphic gaps).
      I'm still trying to solve this but I am afraid the tweening enginge does not support
      this.
      Maybe it's time for a new basic tweening class.
      