/**
 * @license Copyright 2016 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import assert from 'assert/strict';

import UserTimingsAudit from '../../audits/user-timings.js';
import {readJson} from '../test-utils.js';

const trace = readJson('../fixtures/artifacts/user-timing/trace.json', import.meta);

function generateArtifactsWithTrace(trace) {
  return {
    traces: {
      defaultPass: trace,
    },
  };
}
describe('Performance: user-timings audit', () => {
  it('evaluates valid input correctly', () => {
    const artifacts = generateArtifactsWithTrace(trace);
    return UserTimingsAudit.audit(artifacts, {computedCache: new Map()}).then(auditResult => {
      const excludedUTs = auditResult.details.items.filter(timing => {
        return UserTimingsAudit.excludedPrefixes.some(prefix => timing.name.startsWith(prefix));
      });
      assert.equal(excludedUTs.length, 0, 'excluded usertimings included in results');

      assert.equal(auditResult.score, 0);
      expect(auditResult.displayValue).toBeDisplayString('4 user timings');

      assert.equal(auditResult.details.items[0].name, 'fetch-end');
      assert.equal(auditResult.details.items[0].timingType, 'Measure');
      expect(auditResult.details.items[0].startTime).toMatchInlineSnapshot(`1597.565`);
      expect(auditResult.details.items[0].duration).toMatchInlineSnapshot(`6.7`);

      assert.equal(auditResult.details.items[1].name, 'start');
      assert.equal(auditResult.details.items[1].timingType, 'Mark');
      expect(auditResult.details.items[1].startTime).toMatchInlineSnapshot(`688.369`);
      assert.equal(auditResult.details.items[1].duration, undefined);

      assert.equal(auditResult.details.items[2].name, 'fetch-start');
      assert.equal(auditResult.details.items[2].timingType, 'Mark');
      expect(auditResult.details.items[2].startTime).toMatchInlineSnapshot(`1604.267`);
      assert.equal(auditResult.details.items[2].duration, undefined);
    });
  });

  it('doesn\'t throw when user_timing events have a colon', () => {
    const artifacts = generateArtifactsWithTrace(trace);
    return UserTimingsAudit.audit(artifacts, {computedCache: new Map()}).then(result => {
      const fakeEvt = result.details.items.find(item => item.name === 'Zone:ZonePromise');
      assert.ok(fakeEvt, 'failed to find user timing item with colon');
    });
  });
});
