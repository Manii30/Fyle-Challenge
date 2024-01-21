const username = 'johnpapa';
const token =
  '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';

let pageNo = 1;
let totalRepos = 0;
let pageSize = 10;
let search = '';

document.addEventListener('DOMContentLoaded', function (event) {
  fetchData();
});

function setPageSize() {
    pageSize = $("#pageSize").val();
    fetchRepoData(1);
    setPaginationButtons();
}

function fetchData() {
  const apiUrl = `https://api.github.com/users/${username}`;

  toggleLoader(1);
  fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Repository Data:', data);

      if (data.avatar_url && data.bio && data.location && data.name) {
        $('.userImage').css('background-image', `url(${data.avatar_url})`);
        $('#name').html(data.name);
        $('#bio').html(data.bio);
        $('#location').html(data.location);
        $('#twitter').html('http://twitter.com/'+ data.twitter_username);
        $('#git').html(data.html_url);
      }
      totalRepos = data.public_repos;
      fetchRepoData(1);
      setPaginationButtons();
    })
    .catch((error) => {
      console.error('Error fetching repositories:', error);
    });
}

function fetchRepoData(pageNo) {
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  toggleLoader(1);

  if (search) {
    const apiUrl = `https://api.github.com/search/repositories?per_page=${pageSize}&page=${pageNo}&q=user:${username}+${search}`;
    fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.total_count > 0 && data.items.length > 0) {
          totalRepos = data.total_count;
          if (pageNo === 1) {
            setPaginationButtons();
          }
          let repoHtml = '';
          data.items.map((d) => {
            repoHtml += repoTemplate(d);
          });
          $('#repositories').html(repoHtml);
          toggleLoader(0);
        } else {
          alert('No Data Found');
          toggleLoader(0);
        }
      })
      .catch((error) => {
        console.error('Error fetching repositories:', error);
      });
  } else {
      const apiUrl = `https://api.github.com/users/${username}/repos?per_page=${pageSize}&page=${pageNo}`;
      fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.length > 0) {
            let repoHtml = '';
            data.map((d) => {
              repoHtml += repoTemplate(d);
            });
            $('#repositories').html(repoHtml);
            toggleLoader(0);
          }
        })
        .catch((error) => {
          console.error('Error fetching repositories:', error);
        });
    }
  }


function setPagination(number) {
  const pn = pageNo + number;
  if (pn > 0) {
    if (pn <= totalRepos / pageSize + 1) {
      setPageNo(pn);
    }
  }
}

function paginationController(pn) {
  if (pn === 1) {
    $('.page_previous').addClass('disabled');
  } else {
    $('.page_previous').removeClass('disabled');
  }
  if (pn === parseInt(totalRepos / pageSize + 1)) {
    $('.page_next').addClass('disabled');
  } else {
    $('.page_next').removeClass('disabled');
  }
}

function setPageNo(number) {
  pageNo = number;
  paginationController(number);
  $('.pagination .active').removeClass('active');
  $('.pagination .page_' + number).addClass('active');
  fetchRepoData(number);
}

function repoTemplate(data) {
  let html = '';
  html += `<div class="repository" onclick="openUrl('${data.html_url}')">`;
  html += '<h3>' + data.name + '</h3>';
  html += '<div class="repo-bio">' + data.description + '</div>';
  html += '<div class="repo-topics">';
  data.topics.map((t) => {
    html += '<div class="repo-topic">' + t + '</div>';
  });
  html += '</div>';
  html += '</div>';
  return html;
}
function openUrl(url) {
  window.open(url, '_blank').focus();
}
function setPaginationButtons() {
  let html =
    '<li class="page-item page_previous" onclick="setPagination(-1)"><a class="page-link">Previous</a></li><li class="page-item page_1 active" onclick="setPageNo(1)"><a class="page-link">1</a></li>';
  for (let i = 2; i <= totalRepos / pageSize + 1; i++) {
    html += `<li class="page-item page_${i}" onclick="setPageNo(${i})"><a class="page-link">${i}</a></li>`;
  }
  html +=
    '<li class="page-item page_next" onclick="setPagination(1)"><a class="page-link">Next</a></li>';
  $('#pagination').html(html);
  paginationController(1);
}

function toggleLoader(number) {
  if (number === 1) {
    $('.loader-wrapper').css('display', 'flex');
  } else {
    $('.loader-wrapper').css('display', 'none');
  }
}

function searchRepo() {
  search = $('#search').val();
  pageNo = 1;
  totalRepos = 0;
  fetchRepoData(1);
  $('.clearSearch').css('display', 'block');
}

function clearSearch() {
  $('#search').val('');
  search = '';
  pageNo = 1;
  totalRepos = 0;
  fetchData();
  $('.clearSearch').css('display', 'none');
}
