import { useAtomValue } from 'jotai';
import pdfjs from 'pdfjs-dist';
import { useEffect, useRef } from 'react';
import './PdfPage.css';
import { scaleAtom, searchTextAtom } from './atoms';

type PdfPageProps = {
  page: any;
};

const PdfPage = (props: PdfPageProps) => {
  const { page } = props;

  const text = useAtomValue(searchTextAtom);
  const scale = useAtomValue(scaleAtom);

  const canvasRef: any = useRef();

  const textLayerRef: any = useRef();

  function numberOfOccurrences(textContent: any) {
    let textOCR = '';
    //console.log(textContent.items);
    textContent.items.map((p: any) => {
      //console.log(p.str);
      textOCR = textOCR.concat(p.str);
    });
    // console.log(textOCR);

    //Lowercase
    textOCR = textOCR.toLowerCase();

    // Get number of ocurrences
    let ocurrences = textOCR.split('boring').length - 1;

    //console.log(ocurrences);
    return ocurrences;
  }

  function printRectInCanvas(canvasContext: any) {
    canvasContext.fillStyle = 'blue';
    canvasContext.fillRect(50, 50, 100, 100); // Adjust the coordinates (x, y) and size (width, height)
  }

  let collection: HTMLCollection;
  useEffect(() => {
    collection = textLayerRef.current.children;
  }, []);

  useEffect(() => {
    console.log(collection);
    console.log({ collection });
    if (collection !== null && collection !== undefined) {
      console.log('collection is not null');
      let spanArray: any = Array.from(collection);
      console.log(spanArray);
      spanArray.map((span: any) => {
        console.log(text);
        //TODO: Increase occurence counter inside this if
        if (text !== '' && span.textContent.toLowerCase().includes(text))
          span.classList.add('highlighted');
      });
    }
  }, [text]);

  useEffect(() => {
    if (!page) {
      return;
    }
    const viewport = page.getViewport({ scale });

    // Prepare canvas using PDF page dimensions
    const canvas: any = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      const renderTask = page.render(renderContext);
      renderTask.promise.then(function () {
        // console.log("Page rendered");
      });

      page.getTextContent().then((textContent: any) => {
        if (!textLayerRef.current) {
          return;
        }

        // Pass the data to the method for rendering of text over the pdf canvas.
        var textToRender = pdfjs.renderTextLayer({
          textContent: textContent,
          container: textLayerRef.current,
          viewport: viewport,
          textDivs: [],
        });

        // Draw a blue rectangle on the canvas
        //printRectInCanvas(context);
      });
    }
  }, [page, scale]);

  return (
    <div className='PdfPage'>
      <canvas id='canvas' ref={canvasRef} />
      <div id='textLayer' ref={textLayerRef} className='PdfPage__textLayer' />
    </div>
  );
};

export default PdfPage;
