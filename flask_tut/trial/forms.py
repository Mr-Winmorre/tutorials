from flask_wtf import FlaskForm
from wtforms import (StringField, PasswordField, SubmitField, IntegerField, FormField, FieldList, Form)
from wtforms.validators import DataRequired, Email, EqualTo, Optional, Length, Regexp


class RegistrationForm(FlaskForm):
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password",
                             validators=[DataRequired(), Length(min=8, message="Password be at least 8 characters"),
                                         Regexp("^(?=.*[a-z])", message="Password must have a lowercase character"),
                                         Regexp("^(?=.*[A-Z])", message="Password must have an uppercase character"),
                                         Regexp("^(?=.*\\d)", message="Password must contain a number"),
                                         Regexp(
                                             "(?=.*[@$!%*#?&])", message="Password must contain a special character"
                                         ),
                                         ],
                             )
    submit = SubmitField("Submit")


class LoginForm(FlaskForm):
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password")
