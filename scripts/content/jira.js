// requires MESSAGE_BUS

const ISSUE_ID_REGEX = /\w+-\d+/;
const JIRA_REST_API_ISSUE_PATH = '/rest/api/2/issue/';
const JIRA_BROWSE_PATH_FRAGMENT = '/browse/';
const JIRA_SELECTED_ISSUE_QUERY_PARAM = 'selectedIssue';

const getTicketId = () => {
  let ticketId;

  const path = window.location.pathname;
  if (path.startsWith(JIRA_BROWSE_PATH_FRAGMENT)) {
    const matchedIdTokens = ISSUE_ID_REGEX.exec(path);
    if (matchedIdTokens && matchedIdTokens.length === 1) {
      ticketId = matchedIdTokens[0];
    }
  }

  if (!ticketId) {
    const urlParams = new URLSearchParams(window.location.search);
    ticketId = urlParams.get(JIRA_SELECTED_ISSUE_QUERY_PARAM);
  }

  return ticketId;
};

function getTicketDetails() {
  const ticketId = getTicketId();
  if (!ticketId) {
    return null;
  }
  const request = new XMLHttpRequest();
  let response = null;
  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      response = JSON.parse(request.responseText);
    }
  };

  // Request must be synchronous because of the message bus API - when the listener function is called,
  // the sendResponse must be called within its body before the function call ends.
  request.open("GET", JIRA_REST_API_ISSUE_PATH + ticketId, false);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send();
  return response;
}

function extractAssignee(ticketDetails) {
  if (ticketDetails.fields.assignee) {
    return ticketDetails.fields.assignee.displayName;
  }
  return 'Unassigned'
}

const scrapeJiraTicketInfo = () => {
  const ticketDetails = getTicketDetails();
  if (!ticketDetails) {
    return null;
  }
  const issueKey = ticketDetails.key;
  const issueSummary = ticketDetails.fields.summary;
  const issueType = ticketDetails.fields.issuetype.name;
  const issueAssignee = extractAssignee(ticketDetails);
  const issueReporter = ticketDetails.fields.reporter.displayName;
  const issuePriority = ticketDetails.fields.priority.name;
  const issueStatus = ticketDetails.fields.status.name;

  if (issueKey && issueSummary && issueType && issueAssignee && issueReporter && issuePriority && issueStatus) {
    return {
      source: 'Jira',
      summary: issueSummary,
      href: window.location.origin + JIRA_BROWSE_PATH_FRAGMENT + issueKey,
      issueType: issueType,
      assignee: issueAssignee,
      reporter: issueReporter,
      priority: issuePriority,
      status: issueStatus
    };
  }
  return null;
};

chrome.runtime.onMessage.addListener((_1, _2, sendResponse) => {
  const taskDefinition = scrapeJiraTicketInfo();

  if (taskDefinition) {
    sendResponse({
      success: true,
      taskDefinition
    });
  } else {
    const notification = {
      iconUrl: 'images/info-icon-128.png',
      title: 'Cannot create Todoist task',
      message: 'Please open a Jira issue first'
    };
    sendResponse({
      success: false,
      notification
    });
  }
});