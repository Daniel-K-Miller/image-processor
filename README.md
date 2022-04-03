# image-processor
Simple processing utility to resize/compress images using JIMP generating multiple images at specified sizes.

1. run in terminal "npm install"
2. place photos you want to process into "assets/unprocessed" folder - path to file may look like "assets/unprocessed.tabby.png"  
      NOTE: can also includes folders e.g. "assets/unprocessed/cats/tabby.jpg"
3. run "npm run start <quality> <exportImageWidth1> <exportImageWidth2> <exportImageWidth3>"
      NOTE: remove square brackets - arguments past quality argument are all export image width
 
Files will be exported into the "assets/processed" folder
  - if the unprocessed file was placed at the top level, the processed file can be found at "assets/processed/tabby/1080.jpg"
  - if the unprocessed file was placed inside parent folder(s),  the processed file can be found at "assets/processed/cats/tabby/1080.jpg"
