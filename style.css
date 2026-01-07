<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Turbo Aural</title>
  <link rel="stylesheet" href="style.css?v=TAURAL_HLOL_1" />
</head>
<body>
  <!-- Crest watermark (expects crest.png in the same folder) -->
  <div class="crest-watermark" aria-hidden="true"></div>

  <main class="wrap">
    <header class="topbar">
      <div class="brand">
        <div class="logo-dot" aria-hidden="true"></div>
        <div>
          <h1>Turbo Aural</h1>
          <p class="sub">Leaving Cert Spanish — link-out listening practice</p>
        </div>
      </div>

      <div class="pill-row">
        <span class="pill" id="pillYear">Year: —</span>
        <span class="pill" id="pillPaperLevel">Level: —</span>
        <span class="pill" id="pillMode">Mode: —</span>
      </div>
    </header>

    <!-- HOME -->
    <section class="card" id="screenHome">
      <div class="card-head">
        <h2>Choose your setup</h2>
        <p class="muted">
          Use a <b>Match Code</b> so everyone gets the same 10 prompts on their own device.
        </p>
      </div>

      <div class="grid2">
        <div class="field">
          <label for="yearSelect">Exam year</label>
          <select id="yearSelect"></select>
        </div>

        <div class="field">
          <label for="paperLevelSelect">Paper level (HL / OL)</label>
          <select id="paperLevelSelect">
            <option value="higher">Higher</option>
            <option value="ordinary">Ordinary</option>
          </select>
        </div>

        <div class="field">
          <label for="levelSelect">Turbo level (1 easy → 10 tough)</label>
          <select id="levelSelect"></select>
        </div>

        <div class="field">
          <label for="modeSelect">Mode</label>
          <select id="modeSelect">
            <option value="classic">Classic</option>
            <option value="sprint">Sprint (time cap)</option>
            <option value="survival">Survival (0 wrong)</option>
            <option value="relay">Relay (Player A then Player B)</option>
          </select>
        </div>

        <div class="field">
          <label>Quick links</label>
          <div class="btn-row">
            <button class="btn btn-soft" id="openAudioBtn" type="button">Open Audio (EducatePlus)</button>
            <button class="btn btn-soft" id="openPaperBtn" type="button">Open Paper (Exams.ie)</button>
          </div>
          <p class="hint">Audio is shared HL/OL; Paper link switches HL/OL.</p>
        </div>

        <div class="field">
          <label>Key rule</label>
          <div class="rule-chip">
            Time + penalties. Blanks count as wrong.
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="grid2">
        <div class="field">
          <label for="matchInput">Join with Match Code (7 characters)</label>
          <div class="btn-row">
            <input id="matchInput" type="text" inputmode="latin" maxlength="7" placeholder="e.g. 8A H C0Z K" />
            <button class="btn btn-primary" id="joinMatchBtn" type="button">Join</button>
          </div>
          <p class="hint">Spaces ignored. Code includes Year + HL/OL + Turbo Level + Mode + Seed.</p>
        </div>

        <div class="field">
          <label>Start a new match</label>
          <div class="btn-row">
            <button class="btn btn-primary" id="newMatchBtn" type="button">Generate Match Code</button>
            <button class="btn btn-ghost" id="startSoloBtn" type="button">Start (Solo)</button>
          </div>
          <p class="hint">For class competitions: generate once, everyone joins.</p>
        </div>
      </div>

      <div class="info-box">
        <h3>How to run it in class (fast)</h3>
        <ol>
          <li>Pick <b>Year</b> + <b>HL/OL</b> and click <b>Generate Match Code</b>.</li>
          <li>Students enter the same code on their own devices.</li>
          <li>They click <b>Open Audio</b> and <b>Open Paper</b> and complete the 10 prompts.</li>
          <li>After checking the marking scheme, they tick anything wrong → score updates → they read out the <b>Result Code</b>.</li>
        </ol>
      </div>
    </section>

    <!-- GAME -->
    <section class="card hidden" id="screenGame">
      <div class="game-head">
        <div class="left">
          <h2 id="gameTitle">Round</h2>
          <div class="meta">
            <span class="tag" id="matchTag">Match: —</span>
            <span class="tag" id="penaltyTag">Penalty: —</span>
            <span class="tag" id="capTag">Sprint cap: —</span>
          </div>
        </div>

        <div class="right">
          <div class="timer" id="timer">00:00.0</div>
          <div class="btn-row">
            <button class="btn btn-soft" id="audioQuickBtn" type="button">Audio</button>
            <button class="btn btn-soft" id="paperQuickBtn" type="button">Paper</button>
            <button class="btn btn-ghost" id="quitBtn" type="button">Quit</button>
          </div>
        </div>
      </div>

      <div class="prompt-wrap" id="promptWrap"></div>

      <div class="game-actions">
        <button class="btn btn-ghost" id="prevBtn" type="button">Back</button>
        <button class="btn btn-primary" id="nextBtn" type="button">Next</button>
        <button class="btn btn-primary hidden" id="submitBtn" type="button">Submit</button>
      </div>

      <p class="hint center" id="relayHint"></p>
    </section>

    <!-- RESULTS -->
    <section class="card hidden" id="screenResults">
      <div class="card-head">
        <h2>Results</h2>
        <p class="muted">Tick anything wrong after checking the marking scheme. Blanks count as wrong automatically.</p>
      </div>

      <div class="results-top">
        <div class="bigstat">
          <div class="biglabel">Time</div>
          <div class="bigvalue" id="timeOut">00:00.0</div>
        </div>
        <div class="bigstat">
          <div class="biglabel">Wrong</div>
          <div class="bigvalue" id="wrongOut">0</div>
        </div>
        <div class="bigstat">
          <div class="biglabel">Final score</div>
          <div class="bigvalue" id="scoreOut">0.0s</div>
        </div>
        <div class="bigstat">
          <div class="biglabel">Result code</div>
          <div class="bigvalue code" id="codeOut">------</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="btn-row">
        <button class="btn btn-soft" id="markAllCorrectBtn" type="button">Mark all as correct</button>
        <button class="btn btn-soft" id="markBlanksWrongBtn" type="button">Mark blanks as wrong</button>
      </div>

      <div id="answerList" class="answer-list"></div>

      <div class="divider"></div>

      <div class="btn-row">
        <button class="btn btn-soft" id="copyBtn" type="button">Copy Result</button>
        <button class="btn btn-primary" id="playAgainBtn" type="button">Play Again</button>
        <button class="btn btn-ghost" id="backHomeBtn" type="button">Back to Menu</button>
      </div>

      <p class="copyright">
        © Turbo Aural — practice tool. External exam audio/papers remain the property of their respective rights holders.
      </p>
    </section>
  </main>

  <!-- Modal for "Open Audio" (EducatePlus page vs direct MP3) -->
  <div class="modal hidden" id="audioModal" role="dialog" aria-modal="true" aria-labelledby="audioModalTitle">
    <div class="modal-card">
      <div class="modal-head">
        <h3 id="audioModalTitle">Open audio</h3>
        <button class="btn btn-ghost" id="closeModalBtn" type="button">Close</button>
      </div>
      <div class="modal-body" id="audioModalBody"></div>
      <div class="modal-foot">
        <small class="muted">
          Tip: If direct MP3 links ever fail, use “Open EducatePlus page” and select the year there.
        </small>
      </div>
    </div>
  </div>

  <script src="script.js?v=TAURAL_HLOL_1"></script>
</body>
</html>
