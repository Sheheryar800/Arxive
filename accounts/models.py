from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from jsonfield import JSONField
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

import json


# Create your models here.
class Categories(models.Model):
    main_category = models.CharField(max_length=200)
    slug = models.CharField(max_length=200)
    category = models.CharField(max_length=200)

    def __str__(self):
        return self.main_category


class AlreadyScraped(models.Model):
    date = models.DateField()
    slug = models.CharField(max_length=200)


class Articles(models.Model):
    title = models.CharField(max_length=200, null=True)
    link = models.CharField(max_length=200, null=True)
    sentence = JSONField()
    category = models.ForeignKey(Categories, on_delete=models.DO_NOTHING)
    date = models.DateField()
    author = models.CharField(max_length=200, null=True)

    def __str__(self):
        return self.title


class Subscriber(models.Model):
    email = models.CharField(max_length=200)

    def __str__(self):
        return self.email


class Newsletter(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    subject = models.CharField(max_length=150)
    contents = models.FileField(upload_to='uploaded_newsletters/')

    def __str__(self):
        return self.subject + " " + self.created_at.strftime("%B %d, %Y")

    def send(self, request):
        contents = self.contents.read().decode('utf-8')
        subscribers = Subscriber.objects.all()
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        for sub in subscribers:
            message = Mail(
                from_email=settings.FROM_EMAIL,
                to_emails=sub.email,
                subject=self.subject,
                html_content=contents + (
                    '<br><a href="{}?email={}">Unsubscribe</a>.').format(
                    request.build_absolute_uri('/delete/'),
                    sub.email))
            sg.send(message)
