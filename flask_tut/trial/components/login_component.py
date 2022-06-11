from flask_meld import Component
from trial.forms import LoginForm


class LoginComponent(Component):
    form = LoginForm()

    def updated(self, field):
        self.validate(field)
