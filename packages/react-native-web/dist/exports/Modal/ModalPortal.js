/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
import { useEffect, useRef } from 'react';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';
import ReactDOM from 'react-dom';

function ModalPortal(props) {
  var children = props.children;
  var elementRef = useRef(null);

  if (canUseDOM && !elementRef.current) {
    var element = document.createElement('div');

    if (element && document.body) {
      document.body.appendChild(element);
      elementRef.current = element;
    }
  }

  useEffect(function () {
    if (canUseDOM) {
      return function () {
        if (document.body && elementRef.current) {
          document.body.removeChild(elementRef.current);
          elementRef.current = null;
        }
      };
    }
  }, []);
  return elementRef.current && canUseDOM ? ReactDOM.createPortal(children, elementRef.current) : null;
}

export default ModalPortal;