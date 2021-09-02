https://www.bytesizearxiv.org

Stay up to date on cutting edge research on ArXiv .org with byte size summaries of brand new publications auto generated using ML (TF-IDF).
Newsletter coming soon

Installation instructions:
  create and activate your virtual environment: 
  
    python -m venv env
    
  To activate the virtual environment open terminal and run:
  
    .\env\Scripts\activate
    
  To install all requirements run this next:
  
    pip install -r requirements.txt
    
  delete folders: migrations, _pycache_, and delete db.sqlite3
  once deleted run:
  
    python manage.py makemigrations accounts
    
    python manage.py migrate
    
    python manage.py runserver
  
  With the running server on your local http://127.0.0.1:8000/ user your browser to populate categories by navigating to:
    
    http://127.0.0.1:8000/populate_categories
    
  you can now start the npm server in another terminal using:
  
    npm start
  

Built with React / Django with arxiv API query and TF-IDF in Python.
