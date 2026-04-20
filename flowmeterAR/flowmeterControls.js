window.addEventListener("load", () => {
  const scene = document.querySelector("a-scene");
  scene.addEventListener("loaded", () => {
    
    // In order to get transparent cylinders to properly intersect a transparent GLB both need
    // to have their DEPTHTEST set to FALSE. This leads to some unusual behavior elsewhere but
    // the desire to have a pointer to the element of interest is more important in this 
    // context.
    // document.querySelector('#flowmeter').addEventListener('model-loaded', (e) => {
    //   console.log("here");
    //   e.detail.model.traverse((node) => {
    //     if (node.isMesh) {
    //       node.material.depthTest = false;
    //       node.material.needsUpdate = true;
    //     }
    //   });
    // });

    // Label image size auto-adjust
    const imgHeight = 0.5;
    const images = document.querySelectorAll('a-image'); // labels are the only images in the scene
    images.forEach((img, index) => {
      const width0 = img.getAttribute('width');
      const height0 = img.getAttribute('height');
      img.setAttribute('height', imgHeight);
      img.setAttribute('width', width0/height0*imgHeight);
    });


    // Connect entitites to labels with a line
    const map = new Map(); // [label id, line id]
    map.set("anchor-flowmeter", "line-flowmeter");
    map.set("anchor-magnet", "line-magnet");
    map.set("anchor-sensor", "line-sensor");
    map.set("anchor-signal-output", "line-signal-output");
    map.set("anchor-water-in", "line-water-in");
    map.set("anchor-water-out", "line-water-out");

    map.forEach((lineID, labelID) => {
      const elLine = document.getElementById(`${lineID}`);
      const elLabel = document.getElementById(`${labelID}`);
      const posOrigin = elLine.getAttribute('position');
      const posTarget = elLabel.object3D.getWorldPosition(new THREE.Vector3());
      const startPoint = {x: posOrigin.x, y: posOrigin.y, z: posOrigin.z};
      const endPoint = {x: posTarget.x, y: posTarget.y, z: posTarget.z};
      setCylinderFromEndpoints(elLine, startPoint, endPoint);
      elLine.setAttribute('radius', 0.02);
      elLine.setAttribute('color', 'Fuchsia');
    })

    // Cylinder connection calculations (ChatGPT)    
    function setCylinderFromEndpoints(el, A, B) {
      const a = new THREE.Vector3(A.x, A.y, A.z);
      const b = new THREE.Vector3(B.x, B.y, B.z);

      // Midpoint to position
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      el.setAttribute('position', mid);

      // Length to height
      const dir = new THREE.Vector3().subVectors(b, a);
      const length = dir.length();
      el.setAttribute('height', length);

      // rotation (align Y-axis to direction)
      const yAxis = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(yAxis, dir.clone().normalize());

      el.object3D.quaternion.copy(quat);
    };



    // Opacity sliders
    const flowmeterEntity = document.querySelector('#entityGLBflowmeter');
    const sliderCase = document.querySelector('#sliderCase');
    const sliderPCB = document.querySelector('#sliderPCB');
    const sliderLabels = document.querySelector('#sliderLabels');

    sliderCase.addEventListener('input', () => {
      const value1 = sliderCase.value;
      const value2 = sliderPCB.value;
      flowmeterEntity.setAttribute('model-opacity', 
          `meshOpacities: body-1:${value1}, cap_outer-1:${value1}, cap_inner-1:${value1}, pcbBoard-1:${value2}`);
    });

    sliderPCB.addEventListener('input', () => {
      const value1 = sliderCase.value;
      const value2 = sliderPCB.value;
      flowmeterEntity.setAttribute('model-opacity', 
          `meshOpacities: body-1:${value1}, cap_outer-1:${value1}, cap_inner-1:${value1}, pcbBoard-1:${value2}`);
    });

    sliderLabels.addEventListener('input', () => {
      const value = sliderLabels.value;
      // const entities = document.querySelectorAll('a-image, [line]'); // this was when connectors were lines
      const entities = document.querySelectorAll('a-image, a-cylinder');
      entities.forEach(el => {
        el.setAttribute('material', 'opacity', value);
      });
      //   if (el.hasAttribute('line')) { // this snippet was part of an if statement back when connectors were lines
      //     const lineObj = el.getObject3D('line');
      //     lineObj.material.transparent = true;
      //     lineObj.material.opacity = value;
      //     lineObj.material.needsUpdate = true;
      //   } else { // do normal setAttribute 
      //     el.setAttribute('material', 'opacity', value); // for labels (a-images)
      //   };
      // });   
    });

    });
});

