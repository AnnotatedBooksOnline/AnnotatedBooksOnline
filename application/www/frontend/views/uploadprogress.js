/*
* Upload progress indicator.
*/

function UploadProgress()
{
this.constructor.apply(this, arguments);
}

UploadProgress.prototype.constructor = function(target, id, filename)
{
    this.containerElement = document.getElementById(id);

    if (target.childNodes.length === 0)
    {
        var table = document.createElement('table');
        table.className = 'x-grid-table';
        table.style.width = '100%';
        target.appendChild(table);
    }
    target = target.childNodes[0];

    if (!this.containerElement)
    {
        this.containerElement = document.createElement('tr');
        this.containerElement.className = "x-grid-row";
        this.containerElement.id = id;

        var filenameText = document.createElement('td');
        filenameText.style.width = '400px';
        filenameText.style.verticalAlign = 'middle';
        filenameText.className = "x-grid-cell x-grid-cell-first x-grid-cell-inner";
        filenameText.appendChild(document.createTextNode(filename));

        var progressBarContainer = document.createElement('td');
        progressBarContainer.style.width = '212px';
        progressBarContainer.className = "x-grid-cell x-grid-cell-inner";
        var progressBar = document.createElement('div');
        progressBar.className = 'x-progress x-progress-default';
        progressBar.style.width = '200px';
        var progressTextBack = document.createElement('div');
        progressTextBack.className = 'x-progress-text x-progress-text-back';
        progressTextBack.style.width = '200px';
        progressTextBack.innerHTML = '0%';
        progressBar.appendChild(progressTextBack);
        var progress = document.createElement('div');
        progress.className = 'x-progress-bar';
        progress.style.width = '0px';
        var progressText = document.createElement('div');
        progressText.className = 'x-progress-text';
        progressText.style.width = '200px';
        progressText.innerHTML = '0%';
        progress.appendChild(progressText);
        progressBar.appendChild(progress);
        progressBarContainer.appendChild(progressBar);

        var statusText = document.createElement('td');
        statusText.style.width = '140px';
        statusText.style.verticalAlign = 'middle';
        statusText.className = "x-grid-cell x-grid-cell-inner";
        statusText.innerHTML = "&nbsp;";

        this.fileNameElement = filenameText;
        this.progressBarElement = progressBar;
        this.statusTextElement = statusText;

        this.containerElement.appendChild(filenameText);
        this.containerElement.appendChild(progressBarContainer);
        this.containerElement.appendChild(statusText);

        target.appendChild(this.containerElement);
        this.targetElement = target;
    }
    else
    {
        this.targetElement = target;
        this.fileNameElement = this.containerElement.childNodes[0];
        this.progressBarElement = this.containerElement.childNodes[1].firstChild;
        this.statusTextElement = this.containerElement.childNodes[2];
    }
}

UploadProgress.prototype.setProgress = function(percentage)
{
    var width = (2 * percentage) + 'px';
    this.progressBarElement.childNodes[1].style.width = width;
    this.progressBarElement.childNodes[1].childNodes[0].style.width = width;
    this.progressBarElement.childNodes[0].innerHTML = percentage + '%';
    this.progressBarElement.childNodes[1].childNodes[0].innerHTML = percentage + '%';
}

UploadProgress.prototype.setStatus = function(status)
{
    this.statusTextElement.innerHTML = status;
}

UploadProgress.prototype.destroy = function()
{
    this.targetElement.removeChild(this.containerElement);
}

