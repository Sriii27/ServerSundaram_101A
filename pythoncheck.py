from github import Github
from github import Auth

def fetch_logs_pygithub(repo_url, token=None):
    # Setup authentication
    auth = Auth.Token(token) if token else None
    g = Github(auth=auth)
    
    # Extract 'owner/repo'
    repo_name = "/".join(repo_url.strip("/").split("/")[-2:])
    
    try:
        repo = g.get_repo(repo_name)
        commits = repo.get_commits()
        
        print(f"Fetching logs for: {repo.full_name}\n" + "-"*30)
        for commit in commits[:20]:  # Limit to 20 for preview
            print(f"{commit.sha[:7]} | {commit.commit.author.date} | {commit.commit.message.splitlines()[0]}")
            
    except Exception as e:
        print(f"An error occurred: {e}")

# Usage
fetch_logs_pygithub("https://github.com/tensorflow/tensorflow", "your_token_here")