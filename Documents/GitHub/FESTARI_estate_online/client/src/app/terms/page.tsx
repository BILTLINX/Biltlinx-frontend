"use client";

import { useState } from "react";
import Link from "next/link";

export default function TermsPage() {
  const [accepted, setAccepted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#BE4D00]">Terms and Conditions</h1>
        <h2 className="mt-2 text-sm font-semibold text-gray-800">Your Agreement</h2>

        <div className="mt-4 max-h-64 overflow-y-auto pr-2 text-sm text-gray-700 space-y-3 scrollbar-orange">
          <p><span className="font-semibold">Last Revised:</span> December 16, 2013</p>
          <p>
            Welcome to www.lorem-ipsum.info. This site is provided as a service to our visitors and may be
            used for informational purposes only. Because the Terms and Conditions contain legal obligations,
            please read them carefully.
          </p>

          <h3 className="font-semibold">1. YOUR AGREEMENT</h3>
          <p>
            By using this Site, you agree to be bound by, and to comply with, these Terms and Conditions. If
            you do not agree to these Terms and Conditions, please do not use this site.
          </p>
          <p>
            PLEASE NOTE: We reserve the right, at our sole discretion, to change, modify or otherwise alter
            these Terms and Conditions at any time. Unless otherwise indicated, amendments will become
            effective immediately. Please review these Terms and Conditions periodically. Your continued use of
            the Site following the posting of changes and/or modifications will constitute your acceptance of
            the revised Terms and Conditions and the reasonableness of these standards for notice of changes.
            For your information, this page was last updated as of the date at the top of these terms and
            conditions.
          </p>

          <h3 className="font-semibold">2. PRIVACY</h3>
          <p>
            Please review our Privacy Policy, which also governs your visit to this Site, to understand our
            practices.
          </p>

          <h3 className="font-semibold">3. LINKED SITES</h3>
          <p>
            This Site may contain links to other independent third-party Web sites (&quot;Linked Sites&quot;). These
            Linked Sites are provided solely as a convenience to our visitors. Such Linked Sites are not under
            our control, and we are not responsible for and does not endorse the content of such Linked Sites,
            including any information or materials contained on such Linked Sites. You will need to make your
            own independent judgment regarding your interaction with these Linked Sites.
          </p>

          <h3 className="font-semibold">4. FORWARD LOOKING STATEMENTS</h3>
          <p>
            All materials reproduced on this site speak as of the original date of publication or filing. The
            fact that a document is available on this site does not mean that the information contained in such
            document has not been modified or superseded by events or by a subsequent document or filing. We
            have no duty or policy to update any information or statements contained on this site and,
            therefore, such information or statements should not be relied upon as being current as of the date
            you access this site.
          </p>

          <h3 className="font-semibold">5. DISCLAIMER OF WARRANTIES AND LIMITATION OF LIABILITY</h3>
          <p>
            A. THIS SITE MAY CONTAIN INACCURACIES AND TYPOGRAPHICAL ERRORS. WE DOES NOT WARRANT THE ACCURACY OR
            COMPLETENESS OF THE MATERIALS OR THE RELIABILITY OF ANY ADVICE, OPINION, STATEMENT OR OTHER
            INFORMATION DISPLAYED OR DISTRIBUTED THROUGH THE SITE. YOU EXPRESSLY UNDERSTAND AND AGREE THAT: (i)
            YOUR USE OF THE SITE, INCLUDING ANY RELIANCE ON ANY SUCH OPINION, ADVICE, STATEMENT, MEMORANDUM, OR
            INFORMATION CONTAINED HEREIN, SHALL BE AT YOUR SOLE RISK; (ii) THE SITE IS PROVIDED ON AN &quot;AS IS&quot;
            AND &quot;AS AVAILABLE&quot; BASIS; (iii) EXCEPT AS EXPRESSLY PROVIDED HEREIN WE DISCLAIM ALL WARRANTIES OF
            ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, WORKMANLIKE EFFORT, TITLE AND NON-INFRINGEMENT;
            (iv) WE MAKE NO WARRANTY WITH RESPECT TO THE RESULTS THAT MAY BE OBTAINED FROM THIS SITE, THE
            PRODUCTS OR SERVICES ADVERTISED OR OFFERED OR MERCHANTS INVOLVED; (v) ANY MATERIAL DOWNLOADED OR
            OTHERWISE OBTAINED THROUGH THE USE OF THE SITE IS DONE AT YOUR OWN DISCRETION AND RISK; and (vi)
            YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR COMPUTER SYSTEM OR FOR ANY LOSS OF DATA THAT
            RESULTS FROM THE DOWNLOAD OF ANY SUCH MATERIAL.
          </p>
          <p>
            B. YOU UNDERSTAND AND AGREE THAT UNDER NO CIRCUMSTANCES, INCLUDING, BUT NOT LIMITED TO, NEGLIGENCE,
            SHALL WE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE OR CONSEQUENTIAL DAMAGES
            THAT RESULT FROM THE USE OF, OR THE INABILITY TO USE, ANY OF OUR SITES OR MATERIALS OR FUNCTIONS ON
            ANY SUCH SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THE FOREGOING
            LIMITATIONS SHALL APPLY NOTWITHSTANDING ANY FAILURE OF ESSENTIAL PURPOSE OF ANY LIMITED REMEDY.
          </p>

          <h3 className="font-semibold">6. EXCLUSIONS AND LIMITATIONS</h3>
          <p>
            SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION
            OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. ACCORDINGLY, OUR LIABILITY IN SUCH
            JURISDICTION SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.
          </p>

          <h3 className="font-semibold">7. OUR PROPRIETARY RIGHTS</h3>
          <p>
            This Site and all its Contents are intended solely for personal, non-commercial use. Except as
            expressly provided, nothing within the Site shall be construed as conferring any license under our
            or any third party&apos;s intellectual property rights, whether by estoppel, implication, waiver, or
            otherwise. Without limiting the generality of the foregoing, you acknowledge and agree that all
            content available through and used to operate the Site and its services is protected by copyright,
            trademark, patent, or other proprietary rights. You agree not to: (a) modify, alter, or deface any
            of the trademarks, service marks, trade dress (collectively &quot;Trademarks&quot;) or other intellectual
            property made available by us in connection with the Site; (b) hold yourself out as in any way
            sponsored by, affiliated with, or endorsed by us, or any of our affiliates or service providers;
            (c) use any of the Trademarks or other content accessible through the Site for any purpose other
            than the purpose for which we have made it available to you; (d) defame or disparage us, our
            Trademarks, or any aspect of the Site; and (e) adapt, translate, modify, decompile, disassemble, or
            reverse engineer the Site or any software or programs used in connection with it or its products and
            services.
          </p>
          <p>
            The framing, mirroring, scraping or data mining of the Site or any of its content in any form and
            by any method is expressly prohibited.
          </p>

          <h3 className="font-semibold">8. INDEMNITY</h3>
          <p>
            By using the Site web sites you agree to indemnify us and affiliated entities (collectively
            &quot;Indemnities&quot;) and hold them harmless from any and all claims and expenses, including (without
            limitation) attorney&apos;s fees, arising from your use of the Site web sites, your use of the Products
            and Services, or your submission of ideas and/or related materials to us or from any person&apos;s use of
            any ID, membership or password you maintain with any portion of the Site, regardless of whether
            such use is authorized by you.
          </p>

          <h3 className="font-semibold">9. COPYRIGHT AND TRADEMARK NOTICE</h3>
          <p>
            Except our generated dummy copy, which is free to use for private and commercial use, all other text
            is copyrighted. generator.lorem-ipsum.info © 2013, all rights reserved
          </p>

          <h3 className="font-semibold">10. INTELLECTUAL PROPERTY INFRINGEMENT CLAIMS</h3>
          <p>
            It is our policy to respond expeditiously to claims of intellectual property infringement. We will
            promptly process and investigate notices of alleged infringement and will take appropriate actions
            under the Digital Millennium Copyright Act (&quot;DMCA&quot;) and other applicable intellectual property
            laws. Notices of claimed infringement should be directed to:
          </p>
          <div className="pl-4">
            <p>generator.lorem-ipsum.info</p>
            <p>126 Electricov St.</p>
            <p>Kiev, Kiev 04176</p>
            <p>Ukraine</p>
            <p>contact@lorem-ipsum.info</p>
          </div>

          <h3 className="font-semibold">11. PLACE OF PERFORMANCE</h3>
          <p>
            This Site is controlled, operated and administered by us from our office in Kiev, Ukraine. We make
            no representation that materials at this site are appropriate or available for use at other
            locations outside of the Ukraine and access to them from territories where their contents are
            illegal is prohibited. If you access this Site from a location outside of the Ukraine, you are
            responsible for compliance with all local laws.
          </p>

          <h3 className="font-semibold">12. GENERAL</h3>
          <p>
            A. If any provision of these Terms and Conditions is held to be invalid or unenforceable, the
            provision shall be removed (or interpreted, if possible, in a manner as to be enforceable), and the
            remaining provisions shall be enforced. Headings are for reference purposes only and in no way
            define, limit, construe or describe the scope or extent of such section. Our failure to act with
            respect to a breach by you or others does not waive our right to act with respect to subsequent or
            similar breaches. These Terms and Conditions set forth the entire understanding and agreement
            between us with respect to the subject matter contained herein and supersede any other agreement,
            proposals and communications, written or oral, between our representatives and you with respect to
            the subject matter hereof, including any terms and conditions on any of customer&apos;s documents or
            purchase orders.
          </p>
          <p>
            B. No Joint Venture, No Derogation of Rights. You agree that no joint venture, partnership,
            employment, or agency relationship exists between you and us as a result of these Terms and
            Conditions or your use of the Site. Our performance of these Terms and Conditions is subject to
            existing laws and legal process, and nothing contained herein is in derogation of our right to
            comply with governmental, court and law enforcement requests or requirements relating to your use of
            the Site or information provided to or gathered by us with respect to such use.
          </p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-4">
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="mt-0.5 border-gray-400"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>
            I confirm that I have read and accept the terms and conditions and privacy policy.
          </span>
        </label>
        <div className="flex gap-3">
          <Link
            href="/signup"
            className="py-2 px-4 bg-[#ffffff] text-[#BE4D00] font-medium hover:bg-orange-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BE4D00] text-sm border-[#BE4D00] border"
          >
            Back
          </Link>
          <button
            type="button"
            disabled={!accepted}
            onClick={() => accepted && setShowModal(true)}
            className={
              "py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BE4D00] " +
              (accepted
                ? "bg-[#BE4D00] text-white hover:bg-orange-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed")
            }
          >
            Accept
          </button>
        </div>
      </div>

      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-md rounded-md shadow-lg p-6 space-y-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex items-center text-sm text-gray-700 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Back
            </button>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Terms and Conditions</h3>
              <p className="text-sm text-gray-700">
                By accepting, you agree to the company&apos;s Terms and Conditions
              </p>
            </div>

            <button
              type="button"
              className="w-full py-3 bg-[#BE4D00] text-white font-semibold text-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BE4D00]"
              onClick={() => setShowModal(false)}
            >
              Agree and register
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
