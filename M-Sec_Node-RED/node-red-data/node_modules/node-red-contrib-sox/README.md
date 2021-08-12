Sox Protocol Node
=================


Node RED nodes used for communicating with SoxFire data repository.

The data can be interact with on this website:

http://sox.ht.sfc.keio.ac.jp/tools/SOX_WebDataViewer/

This node subscribes to a sox device and grap data from it.

To build:

```
npm run build
```

To test:

```
npm run test
```

This is a hack to adapt SoxJS library which was written for web browser (e.g the web link above), to run on NodeJS platform.

The core libraries are at sox/lib/sox.

When build, these libraries will be concatenated to sox/lib/soxLib.js and is used for the NodeJS program.

So in order to test the node, it's important to build first to get all the changes in sox/lib/sox updated into the adapted library.
