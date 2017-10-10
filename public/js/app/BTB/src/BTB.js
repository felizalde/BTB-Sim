/*
* Branch target buffer
*/

export class BTB {

  constructor() {
    this.buffer = new Map();
  }

  hasBranch(branch) {
    return this.buffer.has(branch);
  }

  getTarget(branch) {
    if (this.hasBranch(branch)) {
      return this.buffer.get(branch);
    }

    return undefined;
  }

  update(branch, target) {
    this.buffer.set(branch, target);
  }

  forEach(cb) {
    this.buffer.forEach(cb);
  }
}
