/**
 * Copyright (c) Nicolas Gallagher.
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
import React, { useRef, useEffect } from 'react';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';
import View from '../View';
import createElement from '../createElement';
import StyleSheet from '../StyleSheet';
import UIManager from '../UIManager';
/**
 * This Component is used to "wrap" the modal we're opening
 * so that changing focus via tab will never leave the document.
 *
 * This allows us to properly trap the focus within a modal
 * even if the modal is at the start or end of a document.
 */

var FocusBracket = function FocusBracket() {
  return createElement('div', {
    accessibilityRole: 'none',
    tabIndex: 0,
    style: styles.focusBracket
  });
};

function attemptFocus(element) {
  if (!canUseDOM) {
    return false;
  }

  try {
    element.focus();
  } catch (e) {// Do nothing
  }

  return document.activeElement === element;
}

function focusFirstDescendant(element) {
  for (var i = 0; i < element.childNodes.length; i++) {
    var child = element.childNodes[i];

    if (attemptFocus(child) || focusFirstDescendant(child)) {
      return true;
    }
  }

  return false;
}

function focusLastDescendant(element) {
  for (var i = element.childNodes.length - 1; i >= 0; i--) {
    var child = element.childNodes[i];

    if (attemptFocus(child) || focusLastDescendant(child)) {
      return true;
    }
  }

  return false;
}

var ModalFocusTrap = function ModalFocusTrap(_ref) {
  var active = _ref.active,
      children = _ref.children;
  var trapElementRef = useRef();
  var focusRef = useRef({
    trapFocusInProgress: false,
    lastFocusedElement: null
  });
  useEffect(function () {
    if (canUseDOM) {
      var trapFocus = function trapFocus() {
        // We should not trap focus if:
        // - The modal hasn't fully initialized with an HTMLElement ref
        // - Focus is already in the process of being trapped (e.g., we're refocusing)
        // - isTrapActive prop being falsey tells us to do nothing
        if (trapElementRef.current == null || focusRef.current.trapFocusInProgress || !active) {
          return;
        }

        try {
          focusRef.current.trapFocusInProgress = true;

          if (document.activeElement instanceof Node && !trapElementRef.current.contains(document.activeElement)) {
            // To handle keyboard focusing we can make an assumption here.
            // If you're tabbing through the focusable elements, the previously
            // active element will either be the first or the last.
            // If the previously selected element is the "first" descendant
            // and we're leaving it - this means that we should be looping
            // around to the other side of the modal.
            var hasFocused = focusFirstDescendant(trapElementRef.current);

            if (focusRef.current.lastFocusedElement === document.activeElement) {
              hasFocused = focusLastDescendant(trapElementRef.current);
            } // If we couldn't focus a new element then we need to focus onto the trap target


            if (!hasFocused && trapElementRef.current != null && document.activeElement) {
              UIManager.focus(trapElementRef.current);
            }
          }
        } finally {
          focusRef.current.trapFocusInProgress = false;
        }

        focusRef.current.lastFocusedElement = document.activeElement;
      }; // Call the trapFocus callback at least once when this modal has been activated.


      trapFocus();
      document.addEventListener('focus', trapFocus, true);
      return function () {
        return document.removeEventListener('focus', trapFocus, true);
      };
    }
  }, [active]);
  return React.createElement(React.Fragment, null, React.createElement(FocusBracket, null), React.createElement(View, {
    ref: trapElementRef
  }, children), React.createElement(FocusBracket, null));
};

export default ModalFocusTrap;
var styles = StyleSheet.create({
  focusBracket: {
    outlineStyle: 'none'
  }
});