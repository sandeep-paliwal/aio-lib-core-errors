/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const util = require('util')
const AioCoreSDKError = require('./AioCoreSDKError')

/**
 * Returns a function that will dynamically create a class with the
 * error code specified, and updates the objects specified via the Updater parameter.
 *
 * The returned function takes two parameters:
 *    - code (string), which is the error code.
 *    - message (string), which is the error message (can contain format specifiers)
 *
 * @param {string} errorClassName The class name for your SDK Error. Your Error objects will be these objects
 * @param {string} sdkName The name of your SDK. This will be a property in your Error objects
 * @param {function} Updater the object returned from a CreateUpdater call
 * @param {Class} BaseClass the base class that your Error class is extending. AioCoreSDKError is the default
 */
function ErrorWrapper (errorClassName, sdkName, Updater, BaseClass = AioCoreSDKError) {
  return function (code, message) {
    const createClass = curryCreateClass(errorClassName, sdkName, message, BaseClass)
    const clazz = createClass(code)
    Updater(code, message, clazz)
  }
}

/**
 * Returns a function that updates the parameters specified.
 * This is used in ErrorWrapper.
 *
 * @param {object} codes
 * @param {Map} messages
 */
function createUpdater (codes, messages) {
  return function (code, message, clazz) {
    messages.set(code, message)
    codes[code] = clazz
  }
}

/**
 * Returns a function that creates an Error class with the specified parameters.
 * The returned function takes one parameter, code (string), which is the error code.
 *
 * @param {string} errorClassName
 * @param {string} sdkName
 * @param {string} message
 * @param {Class} BaseClass
 */
function curryCreateClass (errorClassName, sdkName, message, BaseClass) {
  return function (code) {
    return class extends BaseClass {
      constructor ({ sdkDetails, messageValues = [] } = {}) {
        // wrap an array around it if not one
        if (!Array.isArray(messageValues)) {
          messageValues = [messageValues]
        }
        super(util.format(message, ...messageValues), code, sdkName, sdkDetails)
        this.name = errorClassName
      }
    }
  }
}

module.exports = {
  ErrorWrapper,
  createUpdater
}
