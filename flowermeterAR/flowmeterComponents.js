AFRAME.registerComponent('fix-depth', {
  init: function () {
    this.el.addEventListener('model-loaded', () => {
      this.el.object3D.traverse((node) => {
        if (node.isMesh && node.material) {
          node.material.transparent = true;
          node.material.opacity = 0;
          node.material.depthWrite = false;
        }
      });
    });
  }
});

// ============================================================================

AFRAME.registerComponent('image-height', {
    schema: {
        value: {type: 'number', default: 1},
    },

    init: function () {
        this.el.addEventListener('materialtextureloaded', () => {
            this.updateHeight();
        })
    },

    updateHeight: function () {
        const mesh = this.el.getObject3D('mesh');
        
        const img = mesh.material.map.source.data;
        const ratio = img.naturalWidth / img.naturalHeight;
        const newHeight = this.data.value;
        const newWidth = newHeight * ratio;

        this.el.setAttribute('height', newHeight);
        this.el.setAttribute('width', newWidth);
    }
})

AFRAME.registerComponent('measure-text', {
    init: function () {
        this.el.addEventListener('textfontset', () => { // wait for the text font to be set
            // console.log("=== here ===");
            // First get the dimensions
            const textobj = this.el.object3D; // create object for this text element
            textobj.updateMatrixWorld(true); // update its world matrices (???)
            const bbox = new THREE.Box3().setFromObject(textobj); // create "dummy" bounding box

            // TODO: update this calculation because y and z aren't always the desired components
            const h = bbox.max.y - bbox.min.y;
            const w = bbox.max.z - bbox.min.z;
            // console.log(bbox);

            // Now create the background entity of the same size
            const bgPlane = document.createElement('a-plane');
            bgPlane.setAttribute('width', w + 0.2);
            bgPlane.setAttribute('height', h + 0.1);
            // bgPlane.setAttribute('width', 2);
            // bgPlane.setAttribute('height', 1);
            bgPlane.setAttribute('color', 'black');
            bgPlane.setAttribute('position', `${w/2} 0 -0.5`); // -0.5 is to prevent "z-fighting", which requires y-offset to be different from the expected 0.1/2=0.05
            
            // Append it to this text marker so stays in place
            this.el.appendChild(bgPlane);
        });
    },

    measure: function () {
        const obj = this.el.object3D; // create object for this element
        obj.updateMatrixWorld(true); // updates its world matrices 
        const bbox = new THREE.Box3().setFromObject(obj); // create "dummy" bounding box
        const dimensions ={
            width: bbox.max.x - bbox.min.x,
            height: bbox.max.y - bbox.min.y,
            depth: bbox.max.z - bbox.min.z
        };
        // console.log('Text dimensions:', dimensions);
    }
})

AFRAME.registerComponent('model-opacity', {
    schema: { 
        meshOpacities: {type: 'string', default: ''}
    },

    init: function () {
        this.el.addEventListener('model-loaded', this.update.bind(this));
    },

    update: function () {
        var mesh = this.el.getObject3D('mesh');
        if (!mesh) { return; }

        // extract mesh names and opacities for the traverse step from 
        var opacityMap = {};
        this.data.meshOpacities
            .split(',')
            .map(function (s) {return s.trim(); })
            .filter(function (s) {return s.length > 0;})
            .forEach(function (entry) {
                var parts = entry.split(':');
                var name = parts[0].trim();
                var opacity = parts[1] !== undefined? parseFloat(parts[1].trim()) : 1.0;
                opacityMap[name] = isNaN(opacity) ? 1.0 : opacity;
            });
        
        // console.log("opacity map: ", opacityMap);

        mesh.traverse(function (node) {
            // Check if the node is a mesh, if not then stop
            if (!node.isMesh) { return; }

            // Check if the mesh name is part of the list, if not then stop
            if (!(node.name in opacityMap)) { return; }

            // console.log("this mesh name: ", node.name);
            // The mesh name is part of the list, set the desired opacity
            var opacity = opacityMap[node.name];
            // console.log("this desired opacity: ", opacity);
            
            var materials = Array.isArray(node.material) ? node.material : [node.material];
            materials.forEach(function (mat) {
                mat.opacity = opacity;
                mat.transparent = opacity < 1.0;
                mat.needsUpdate = true;
            });
        });
    }
});
