from sqlalchemy.inspection import inspect
from datetime import datetime
from .db import db
from itsdangerous import (TimedJSONWebSignatureSerializer
						  as TokenSerializer, BadSignature, SignatureExpired)

SECRET_KEY = "random string"


class Serializer(object):
	def serialize(self):
		return {c: getattr(self, c) for c in inspect(self).attrs.keys()}

	@staticmethod
	def serialize_list(l):
		return [m.serialize() for m in l]


class User(db.Model, Serializer):
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	email = db.Column(db.String, unique=True, nullable=False)
	password = db.Column(db.String, nullable=False)
	portfolios = db.relationship('Portfolio', backref='user', lazy=True)
	cash = db.Column(db.Integer, default="50000")
	game_portfolio = db.relationship('GameHolding', backref='user', lazy=True)

	def __repr__(self):
		return '<User %r>' % self.email

	def serialize(self):
		d = Serializer.serialize(self)
		d['game_portfolio'] = list(
			map(lambda x: x.serialiseNoCollector(), d['game_portfolio']))
		d['portfolios'] = list(
			map(lambda x: x.serialiseNoCollector(), d['portfolios']))
		return d

	def serialiseNoCollection(self):
		d = Serializer.serialize(self)
		del d['game_portfolio']
		del d['portfolios']
		del d['user']
		return d

	def generate_auth_token(self, expiration=6000):
		s = TokenSerializer(SECRET_KEY, expires_in=expiration)
		return s.dumps({'id': self.id})

	@staticmethod
	def verify_auth_token(token):
		s = TokenSerializer(SECRET_KEY)
		try:
			data = s.loads(token)
		except SignatureExpired:
			return None  # valid token, but expired
		except BadSignature:
			return None  # invalid token
		user = User.query.get(data['id'])
		return user


class Portfolio(db.Model, Serializer):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String, nullable=False)
	user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
	holdings = db.relationship('Holding', backref='portfolio', lazy=True)

	def __repr__(self):
		return '<Portfolio %r>' % self.name

	def serialize(self):
		d = Serializer.serialize(self)
		d['user'] = d['user'].serialiseNoCollection()
		d['holdings'] = Serializer.serialize_list(d['holdings'])
		return d

	def serialiseNoCollector(self):
		d = Serializer.serialize(self)
		del d['user']
		d['holdings'] = list(
			map(lambda x: x.serialiseNoCollector(), d['holdings']))
		return d


# TODO: to be completed - add all attributes
class Stock(db.Model, Serializer):
	code = db.Column(db.String(3), primary_key=True)
	last_fetched = db.Column(
		db.DateTime, default=datetime.utcnow(), nullable=False)
	latest_day = db.Column(
		db.DateTime, default=datetime.utcnow(), nullable=False)

	open = db.Column(db.Float, nullable=False)
	high = db.Column(db.Float, nullable=False)
	price = db.Column(db.Float, nullable=False)
	low = db.Column(db.Float, nullable=False)
	previous_close = db.Column(db.Float, nullable=False)
	volume = db.Column(db.Integer, nullable=False)
	change = db.Column(db.Float, nullable=False)
	change_percent = db.Column(db.String, nullable=False)

	sector = db.Column(db.String, nullable=True)
	market_cap = db.Column(db.String, nullable=True)
	ask_price = db.Column(db.String, nullable=False)
	bid_price = db.Column(db.String, nullable=False)
	PE_value = db.Column(db.String, nullable=True)
	company_name = db.Column(db.String, nullable=True)
	description = db.Column(db.String, nullable=True)
	url = db.Column(db.String, nullable=True)
	_52_week_range = db.Column(db.String, nullable=True)
	day_range = db.Column(db.String, nullable=True)
	ex_div_date = db.Column(db.String, nullable=True)

	def __repr__(self):
		return '<Stock %r>' % self.code



class Brief_Stock(db.Model, Serializer):
    code = db.Column(db.String(3), primary_key=True)
    last_fetched = db.Column(
        db.DateTime, default=datetime.utcnow(), nullable=False)
    latest_day = db.Column(
        db.DateTime, default=datetime.utcnow(), nullable=False)

    market_cap = db.Column(db.Integer, nullable = True)
    PE_value = db.Column(db.Float, nullable = True)
    EPS = db.Column(db.Float, nullable = True)
    div_yield = db.Column(db.Float, nullable = True)
    sector = db.Column(db.String, nullable = True)
    string_market_cap = db.Column(db.String, nullable = True)
    ROE = db.Column(db.Float, nullable = True)
    
    def __repr__(self):
        return '<Stock %r>' % self.code


class Holding(db.Model, Serializer):
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	stock_code = db.Column(db.String(3), db.ForeignKey(
		'stock.code'))
	portfolio_id = db.Column(db.Integer, db.ForeignKey(
		'portfolio.id'))
	price = db.Column(db.Float, nullable=False)
	quantity = db.Column(db.Integer, nullable=False)
	date = db.Column(db.DateTime, default=datetime.utcnow())
	stock = db.relationship('Stock')

	def __repr__(self):
		return '<Holding %r>' % self.stock_code

	def serialize(self):
		d = Serializer.serialize(self)
		d['stock'] = d['stock'].serialize()
		return d

	def serialiseNoCollector(self):
		d = {c: getattr(self, c) for c in inspect(self).attrs.keys()}
		d['stock'] = d['stock'].serialize()
		del d['portfolio']
		return d


class GameHolding(db.Model, Serializer):
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
	stock_code = db.Column(db.String(3), db.ForeignKey(
		'stock.code'))
	price = db.Column(db.Float, nullable=False)
	quantity = db.Column(db.Integer, nullable=False)
	date = db.Column(db.DateTime, default=datetime.utcnow())
	stock = db.relationship('Stock')

	def __repr__(self):
		return '<GameHolding %r>' % self.stock_code

	def serialize(self):
		d = Serializer.serialize(self)
		d['stock'] = d['stock'].serialize()
		del d['user']
		return d

	def serialiseNoCollector(self):
		d = {c: getattr(self, c) for c in inspect(self).attrs.keys()}
		d['stock'] = d['stock'].serialize()
		# del d['portfolio']
		del d['user']
		return d
